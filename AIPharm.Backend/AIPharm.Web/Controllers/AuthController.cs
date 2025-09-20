using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using AIPharm.Core.Security;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IRepository<User> userRepository, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                var email = (request.Email ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(request.Password))
                {
                    _logger.LogWarning("Login failed: missing credentials in request.");
                    return BadRequest(new { success = false, message = "Email and password are required" });
                }

                _logger.LogInformation("Login attempt for {Email}", email);

                var user = await _userRepository.FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    _logger.LogWarning("Login failed: user not found for {Email}", email);
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                if (user.IsDeleted)
                {
                    _logger.LogWarning("Login blocked: account marked as deleted for {Email}", email);
                    return Unauthorized(new { success = false, message = "Account is disabled" });
                }

                if (!VerifyPassword(user, request.Password))
                {
                    _logger.LogWarning("Login failed: invalid password for {Email}", email);
                    return Unauthorized(new { success = false, message = "Invalid email or password" });
                }

                var token = GenerateJwtToken(user);

                _logger.LogInformation("Login successful for {Email}", email);

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
                _logger.LogError(ex, "Unexpected error while handling login for {Email}", request.Email);
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var email = (request.Email ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Registration failed: email is required.");
                    return BadRequest(new { success = false, message = "Email is required" });
                }

                if (request.Password != request.ConfirmPassword)
                {
                    _logger.LogWarning("Registration failed: password mismatch for {Email}", email);
                    return BadRequest(new { success = false, message = "Passwords do not match" });
                }

                var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == email);
                if (existingUser != null)
                {
                    _logger.LogWarning("Registration failed: email already exists {Email}", email);
                    return Conflict(new { success = false, message = "User with this email already exists" });
                }

                var user = new User
                {
                    Email = email,
                    FullName = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    Address = request.Address,
                    PasswordHash = HashPassword(request.Password),
                    IsAdmin = false,
                    CreatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                await _userRepository.AddAsync(user);

                _logger.LogInformation("Registration successful for {Email}", email);

                return Ok(new { success = true, message = "Registration successful! You can now log in." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for {Email}", request.Email);
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

            var user = await _userRepository.FirstOrDefaultAsync(u => u.Id == userId);
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

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyValue = _configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(keyValue))
            {
                _logger.LogError("JWT signing key is missing from configuration. Unable to issue token for {Email}", user.Email);
                throw new InvalidOperationException("JWT signing key is missing from configuration.");
            }

            var key = Encoding.UTF8.GetBytes(keyValue);
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

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
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }

        // Use shared password hashing utility
        private string HashPassword(string password) => PasswordHasher.Hash(password);
        
        private bool VerifyPassword(User user, string password) => PasswordHasher.Verify(password, user.PasswordHash);
    }
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
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
