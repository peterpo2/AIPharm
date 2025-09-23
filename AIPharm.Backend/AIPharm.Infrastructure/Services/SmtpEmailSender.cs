using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using AIPharm.Core.Exceptions;
using AIPharm.Core.Interfaces;
using AIPharm.Core.Options;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace AIPharm.Infrastructure.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;
    private readonly string? _pickupDirectory;
    private readonly bool _usePickupDirectory;

    public SmtpEmailSender(
        IOptions<EmailSettings> settings,
        ILogger<SmtpEmailSender> logger,
        IHostEnvironment hostEnvironment)
    {
        _settings = settings.Value;
        _logger = logger;

        var hasPickupPath = !string.IsNullOrWhiteSpace(_settings.PickupDirectory);
        _usePickupDirectory = _settings.UsePickupDirectory && hasPickupPath;

        if (_settings.UsePickupDirectory && !hasPickupPath)
        {
            _logger.LogWarning("Email pickup directory usage was enabled but no directory path was provided.");
        }

        _pickupDirectory = _usePickupDirectory
            ? ResolvePickupDirectory(_settings.PickupDirectory, hostEnvironment.ContentRootPath)
            : null;

        if (_usePickupDirectory && !string.IsNullOrWhiteSpace(_pickupDirectory))
        {
            _logger.LogInformation(
                "Email sender configured to write .eml files to {Directory}",
                _pickupDirectory);
        }
        else
        {
            _logger.LogInformation(
                "Email sender configured for SMTP delivery via {Host}:{Port} (SSL: {EnableSsl})",
                _settings.SmtpHost,
                _settings.SmtpPort,
                _settings.EnableSsl);
        }

        if (!string.IsNullOrWhiteSpace(_settings.OverrideToAddress))
        {
            _logger.LogInformation(
                "Email override address active. All messages will be redirected to {Override}",
                _settings.OverrideToAddress);
        }
    }

    public async Task SendEmailAsync(
        string toEmail,
        string subject,
        string plainTextBody,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new ArgumentException("Recipient email is required", nameof(toEmail));
        }

        cancellationToken.ThrowIfCancellationRequested();

        var trimmedRecipient = toEmail.Trim();
        var destinationEmail = string.IsNullOrWhiteSpace(_settings.OverrideToAddress)
            ? trimmedRecipient
            : _settings.OverrideToAddress.Trim();

        if (string.IsNullOrWhiteSpace(destinationEmail))
        {
            throw new InvalidOperationException("Resolved destination email address is empty.");
        }

        if (!string.Equals(destinationEmail, trimmedRecipient, StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation(
                "Overriding destination email from {OriginalEmail} to {OverrideEmail}",
                trimmedRecipient,
                destinationEmail);
        }

        var message = CreateMimeMessage(trimmedRecipient, destinationEmail, subject, plainTextBody);

        try
        {
            if (_usePickupDirectory && !string.IsNullOrWhiteSpace(_pickupDirectory))
            {
                await SaveToPickupDirectoryAsync(message, destinationEmail, cancellationToken);
                return;
            }

            await SendViaSmtpAsync(message, destinationEmail, cancellationToken);
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(
                ex,
                "SMTP command failed with status {StatusCode} when sending email to {Email}. Response: {Response}",
                ex.StatusCode,
                destinationEmail,
                ex.Message);
            throw new EmailDeliveryException(
                $"SMTP command failed with status {ex.StatusCode}",
                ex);
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(
                ex,
                "SMTP protocol error while sending email to {Email}: {Message}",
                destinationEmail,
                ex.Message);
            throw new EmailDeliveryException("SMTP protocol error during email send.", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", destinationEmail);
            throw new EmailDeliveryException("Unexpected error while sending email.", ex);
        }
    }

    private async Task SendViaSmtpAsync(
        MimeMessage message,
        string destinationEmail,
        CancellationToken cancellationToken)
    {
        using var client = new MailKit.Net.Smtp.SmtpClient
        {
            CheckCertificateRevocation = true
        };

        try
        {
            var socketOptions = _settings.EnableSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.Auto;

            await client.ConnectAsync(
                _settings.SmtpHost,
                _settings.SmtpPort,
                socketOptions,
                cancellationToken);

            client.AuthenticationMechanisms.Remove("XOAUTH2");

            if (!string.IsNullOrWhiteSpace(_settings.Username))
            {
                if (string.IsNullOrWhiteSpace(_settings.Password))
                {
                    _logger.LogWarning(
                        "SMTP username {Username} configured without a password. Attempting to send without authentication.",
                        _settings.Username);
                }
                else
                {
                    await client.AuthenticateAsync(
                        _settings.Username,
                        _settings.Password,
                        cancellationToken);
                }
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation(
                "Email for {Recipient} sent via SMTP server {Host}:{Port}",
                destinationEmail,
                _settings.SmtpHost,
                _settings.SmtpPort);
        }
        finally
        {
            if (client.IsConnected)
            {
                try
                {
                    await client.DisconnectAsync(true, CancellationToken.None);
                }
                catch
                {
                    // Ignore cleanup failures
                }
            }
        }
    }

    private async Task SaveToPickupDirectoryAsync(
        MimeMessage message,
        string destinationEmail,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_pickupDirectory))
        {
            throw new InvalidOperationException("Pickup directory is not configured.");
        }

        Directory.CreateDirectory(_pickupDirectory);

        var fileName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Guid.NewGuid():N}.eml";
        var filePath = Path.Combine(_pickupDirectory, fileName);

        await using (var stream = File.Create(filePath))
        {
            await message.WriteToAsync(stream, cancellationToken);
        }

        _logger.LogInformation(
            "Email for {Recipient} saved to pickup directory {Directory}",
            destinationEmail,
            _pickupDirectory);
    }

    private MimeMessage CreateMimeMessage(
        string originalRecipient,
        string destinationEmail,
        string subject,
        string plainTextBody)
    {
        var message = new MimeMessage();

        var fromName = string.IsNullOrWhiteSpace(_settings.FromName)
            ? _settings.FromAddress
            : _settings.FromName;

        message.From.Add(new MailboxAddress(fromName, _settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(destinationEmail));
        message.Subject = subject ?? string.Empty;
        message.Body = new TextPart(TextFormat.Plain)
        {
            Text = plainTextBody ?? string.Empty
        };

        if (!string.Equals(destinationEmail, originalRecipient, StringComparison.OrdinalIgnoreCase))
        {
            message.Headers.Add("X-Original-Recipient", originalRecipient);
            message.ReplyTo.Add(MailboxAddress.Parse(originalRecipient));
        }

        return message;
    }

    private static string? ResolvePickupDirectory(string? configuredDirectory, string contentRoot)
    {
        if (string.IsNullOrWhiteSpace(configuredDirectory))
        {
            return null;
        }

        var trimmed = configuredDirectory.Trim();

        if (Path.IsPathRooted(trimmed))
        {
            return Path.GetFullPath(trimmed);
        }

        var combined = Path.Combine(contentRoot, trimmed);
        return Path.GetFullPath(combined);
    }
}
