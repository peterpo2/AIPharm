using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using AIPharm.Core.Security;
using AIPharm.Core.Options;
using Microsoft.Extensions.Options;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        private readonly EmailSettings _emailSettings;

        private const string TwoFactorEmailSubject = "AIPharm login verification code";

        public AuthController(
            IRepository<User> userRepository,
            IConfiguration configuration,
            IEmailSender emailSender,
            IOptions<EmailSettings> emailOptions)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _emailSender = emailSender;
            _emailSettings = emailOptions.Value;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null || !VerifyPassword(user, request.Password))
                {
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                if (user.TwoFactorEnabled)
                {
                    var challenge = await PrepareTwoFactorChallengeAsync(user, ignoreCooldown: true, HttpContext.RequestAborted);
                    var message = challenge.EmailSent
                        ? $"Two-factor verification required. A code has been sent to {challenge.DestinationEmail}."
                        : "Two-factor verification required. Please use the most recent code sent to your email.";

                    return Ok(new
                    {
                        success = true,
                        requiresTwoFactor = true,
                        message,
                        twoFactorToken = challenge.TwoFactorToken,
                        destinationEmail = challenge.DestinationEmail,
                        codeExpiresAt = challenge.CodeExpiresAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        emailSent = challenge.EmailSent,
                        cooldownSeconds = Math.Max(0, (int)Math.Ceiling(challenge.CooldownRemaining.TotalSeconds))
                    });
                }

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        address = user.Address,
                        isAdmin = user.IsAdmin,
                        createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        isDeleted = user.IsDeleted
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("verify-2fa")]
        public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorRequest request)
        {
            try
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !user.TwoFactorEnabled)
                {
                    return Unauthorized(new { success = false, message = "Invalid verification request" });
                }

                var now = DateTime.UtcNow;

                if (string.IsNullOrEmpty(user.TwoFactorLoginToken) || !user.TwoFactorLoginTokenExpiry.HasValue || user.TwoFactorLoginTokenExpiry <= now)
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    return Unauthorized(new { success = false, message = "Verification session expired. Please login again." });
                }

                if (!string.Equals(user.TwoFactorLoginToken, request.TwoFactorToken, StringComparison.Ordinal))
                {
                    return Unauthorized(new { success = false, message = "Invalid verification session" });
                }

                if (string.IsNullOrEmpty(user.TwoFactorEmailCodeHash) || !user.TwoFactorEmailCodeExpiry.HasValue || user.TwoFactorEmailCodeExpiry <= now)
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    return Unauthorized(new { success = false, message = "Verification code expired. Please request a new code." });
                }

                if (!PasswordHasher.Verify(request.Code, user.TwoFactorEmailCodeHash))
                {
                    user.TwoFactorEmailCodeAttempts += 1;

                    if (user.TwoFactorEmailCodeAttempts >= _emailSettings.MaxVerificationAttempts)
                    {
                        ClearTwoFactorState(user);
                        await _userRepository.UpdateAsync(user);
                        return Unauthorized(new { success = false, message = "Too many invalid attempts. Please login again." });
                    }

                    await _userRepository.UpdateAsync(user);
                    var attemptsLeft = _emailSettings.MaxVerificationAttempts - user.TwoFactorEmailCodeAttempts;
                    return Unauthorized(new
                    {
                        success = false,
                        message = attemptsLeft > 0
                            ? $"Invalid verification code. {attemptsLeft} attempt(s) remaining."
                            : "Invalid verification code."
                    });
                }

                ClearTwoFactorState(user);
                await _userRepository.UpdateAsync(user);

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    token,
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        fullName = user.FullName,
                        phoneNumber = user.PhoneNumber,
                        address = user.Address,
                        isAdmin = user.IsAdmin,
                        createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                        isDeleted = user.IsDeleted
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("resend-2fa")]
        public async Task<IActionResult> ResendTwoFactor([FromBody] ResendTwoFactorRequest request)
        {
            try
            {
                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !user.TwoFactorEnabled)
                {
                    return Unauthorized(new { success = false, message = "Invalid verification request" });
                }

                var now = DateTime.UtcNow;
                if (string.IsNullOrEmpty(user.TwoFactorLoginToken) || !user.TwoFactorLoginTokenExpiry.HasValue || user.TwoFactorLoginTokenExpiry <= now)
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    return Unauthorized(new { success = false, message = "Verification session expired. Please login again." });
                }

                if (!string.Equals(user.TwoFactorLoginToken, request.TwoFactorToken, StringComparison.Ordinal))
                {
                    return Unauthorized(new { success = false, message = "Invalid verification session" });
                }

                var challenge = await PrepareTwoFactorChallengeAsync(user, ignoreCooldown: false, HttpContext.RequestAborted);

                return Ok(new
                {
                    success = true,
                    requiresTwoFactor = true,
                    emailSent = challenge.EmailSent,
                    destinationEmail = challenge.DestinationEmail,
                    message = challenge.EmailSent
                        ? $"A new verification code has been sent to {challenge.DestinationEmail}."
                        : $"Please wait before requesting another verification code. The last email was sent to {challenge.DestinationEmail}.",
                    twoFactorToken = challenge.TwoFactorToken,
                    codeExpiresAt = challenge.CodeExpiresAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    cooldownSeconds = Math.Max(0, (int)Math.Ceiling(challenge.CooldownRemaining.TotalSeconds))
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (request.Password != request.ConfirmPassword)
                {
                    return BadRequest(new { success = false, message = "Passwords do not match" });
                }

                var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (existingUser != null)
                {
                    return Conflict(new { success = false, message = "User with this email already exists" });
                }

                var user = new User
                {
                    Email = request.Email,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    PasswordHash = HashPassword(request.Password),
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false,
                    TwoFactorEnabled = true
                };

                await _userRepository.AddAsync(user);

                return Ok(new { success = true, message = "Registration successful! You can now log in." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userRepository.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
            if (user == null)
                return NotFound();

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                address = user.Address,
                isAdmin = user.IsAdmin,
                createdAt = user.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                isDeleted = user.IsDeleted
            });
        }

        private async Task<TwoFactorChallengeResult> PrepareTwoFactorChallengeAsync(User user, bool ignoreCooldown, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;

            if (string.IsNullOrEmpty(user.TwoFactorLoginToken) || !user.TwoFactorLoginTokenExpiry.HasValue || user.TwoFactorLoginTokenExpiry <= now)
            {
                user.TwoFactorLoginToken = OneTimePasswordGenerator.GenerateLoginToken();
                user.TwoFactorLoginTokenExpiry = now.AddMinutes(_emailSettings.CodeLifetimeMinutes);
            }

            var cooldownRemaining = TimeSpan.Zero;
            if (!ignoreCooldown && user.TwoFactorLastSentAt.HasValue)
            {
                var nextAllowed = user.TwoFactorLastSentAt.Value.AddSeconds(_emailSettings.ResendCooldownSeconds);
                if (nextAllowed > now)
                {
                    cooldownRemaining = nextAllowed - now;
                }
            }

            var shouldSendEmail = ignoreCooldown || cooldownRemaining == TimeSpan.Zero;
            string? verificationCode = null;
            var destinationEmail = string.IsNullOrWhiteSpace(_emailSettings.OverrideToAddress)
                ? user.Email
                : _emailSettings.OverrideToAddress;

            destinationEmail ??= user.Email;

            if (shouldSendEmail)
            {
                verificationCode = OneTimePasswordGenerator.GenerateNumericCode(_emailSettings.CodeLength);
                user.TwoFactorEmailCodeHash = PasswordHasher.Hash(verificationCode);
                user.TwoFactorEmailCodeExpiry = now.AddMinutes(_emailSettings.CodeLifetimeMinutes);
                user.TwoFactorEmailCodeAttempts = 0;
                user.TwoFactorLastSentAt = now;
            }

            await _userRepository.UpdateAsync(user);

            if (shouldSendEmail && verificationCode != null)
            {
                var body = BuildTwoFactorEmailBody(verificationCode);
                try
                {
                    await _emailSender.SendEmailAsync(user.Email, TwoFactorEmailSubject, body, cancellationToken);
                }
                catch
                {
                    ClearTwoFactorState(user);
                    await _userRepository.UpdateAsync(user);
                    throw;
                }

                return new TwoFactorChallengeResult(
                    user.TwoFactorLoginToken!,
                    destinationEmail,
                    user.TwoFactorEmailCodeExpiry!,
                    TimeSpan.Zero,
                    true);
            }

            return new TwoFactorChallengeResult(
                user.TwoFactorLoginToken!,
                destinationEmail,
                user.TwoFactorEmailCodeExpiry,
                cooldownRemaining,
                false);
        }

        private static void ClearTwoFactorState(User user)
        {
            user.TwoFactorEmailCodeHash = null;
            user.TwoFactorEmailCodeExpiry = null;
            user.TwoFactorEmailCodeAttempts = 0;
            user.TwoFactorLastSentAt = null;
            user.TwoFactorLoginToken = null;
            user.TwoFactorLoginTokenExpiry = null;
        }

        private string BuildTwoFactorEmailBody(string code)
        {
            return $"Your AIPharm verification code is {code}. It expires in {_emailSettings.CodeLifetimeMinutes} minute(s). " +
                   "If you did not request this code, please ignore this email.";
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.FullName ?? user.Email),
                    new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
                }),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        private string HashPassword(string password) => PasswordHasher.Hash(password);

        private bool VerifyPassword(User user, string password) => PasswordHasher.Verify(password, user.PasswordHash);

        private sealed record TwoFactorChallengeResult(
            string TwoFactorToken,
            string DestinationEmail,
            DateTime? CodeExpiresAt,
            TimeSpan CooldownRemaining,
            bool EmailSent);
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class VerifyTwoFactorRequest
    {
        public string Email { get; set; } = string.Empty;
        public string TwoFactorToken { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class ResendTwoFactorRequest
    {
        public string Email { get; set; } = string.Empty;
        public string TwoFactorToken { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
    }
}
