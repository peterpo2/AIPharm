using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using AIPharm.Core.Interfaces;
using AIPharm.Core.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AIPharm.Infrastructure.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailSender> _logger;
        private readonly string? _pickupDirectory;

        public SmtpEmailSender(
            IOptions<EmailSettings> settings,
            ILogger<SmtpEmailSender> logger,
            IHostEnvironment hostEnvironment)
        {
            _settings = settings.Value;
            _logger = logger;
            _pickupDirectory = ResolvePickupDirectory(_settings.PickupDirectory, hostEnvironment.ContentRootPath);
        }

        public async Task SendEmailAsync(string toEmail, string subject, string plainTextBody, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                throw new ArgumentException("Recipient email is required", nameof(toEmail));
            }

            var destinationEmail = string.IsNullOrWhiteSpace(_settings.OverrideToAddress)
                ? toEmail
                : _settings.OverrideToAddress.Trim();

            using var message = new MailMessage
            {
                From = new MailAddress(_settings.FromAddress, _settings.FromName),
                Subject = subject,
                Body = plainTextBody,
                IsBodyHtml = false
            };

            if (string.IsNullOrWhiteSpace(destinationEmail))
            {
                throw new InvalidOperationException("Resolved destination email address is empty.");
            }

            message.To.Add(destinationEmail);

            if (!string.Equals(destinationEmail, toEmail, StringComparison.OrdinalIgnoreCase))
            {
                message.Headers.Add("X-Original-Recipient", toEmail);
                message.ReplyToList.Add(new MailAddress(toEmail));
                _logger.LogInformation(
                    "Overriding destination email from {OriginalEmail} to {OverrideEmail}",
                    toEmail,
                    destinationEmail);
            }

            try
            {
                using var client = CreateClient();

                cancellationToken.ThrowIfCancellationRequested();
                await client.SendMailAsync(message);

                if (!string.IsNullOrWhiteSpace(_pickupDirectory))
                {
                    _logger.LogInformation(
                        "Email for {Recipient} saved to pickup directory {Directory}",
                        destinationEmail,
                        _pickupDirectory);
                }
                else
                {
                    _logger.LogInformation(
                        "Email for {Recipient} sent via SMTP server {Host}:{Port}",
                        destinationEmail,
                        _settings.SmtpHost,
                        _settings.SmtpPort);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw;
            }
        }

        private SmtpClient CreateClient()
        {
            if (!string.IsNullOrWhiteSpace(_pickupDirectory))
            {
                Directory.CreateDirectory(_pickupDirectory);
                return new SmtpClient
                {
                    DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory,
                    PickupDirectoryLocation = _pickupDirectory
                };
            }

            var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = _settings.EnableSsl
            };

            if (!string.IsNullOrEmpty(_settings.Username))
            {
                client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
            }

            return client;
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
                return trimmed;
            }

            return Path.GetFullPath(Path.Combine(contentRoot, trimmed));
        }
    }
}
