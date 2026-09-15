using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<string> GenerateAccessToken(TeamMember member);
        string GenerateRefreshToken();
        Task DeleteRefreshToken(string userId);
        Task<string> DeleteAndGenerateRefreshToken(string userId);
        Task<RefreshResponseDto> RefreshAsync(string refreshToken);
        Task<LoginResponse> LoginUser(LoginDto dto);
        Task UserForgotPassword(string email);
        Task ResetPassword(ResetPasswordDto dto);

    }
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<TeamMember> _userManager;
        private readonly TeamDbContext _teamDbContext;
        private readonly ILogger<AuthService> _logger;
        private readonly IBackgroundTaskQueue _backgroundTaskQueue;

        public AuthService(IConfiguration configuration, IBackgroundTaskQueue backgroundTaskQueue, ILogger<AuthService> logger, UserManager<TeamMember> userManager, TeamDbContext teamDbContext)
        {
            _configuration = configuration;
            _userManager = userManager;
            _teamDbContext = teamDbContext;
            _logger = logger;
            _backgroundTaskQueue = backgroundTaskQueue;
        }

        public async Task<string> GenerateAccessToken(TeamMember member)
        {
            var roles = await _userManager.GetRolesAsync(member);
            var authClaims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, member.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, member.Email ?? throw new InvalidOperationException("User email not found"))
            };

            foreach(var role in roles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt Key not found")));
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddMinutes(30),
                claims: authClaims,
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            _logger.LogInformation("Generated accessToken for {Email}", member.Email);
            return tokenString;
        }

        public string GenerateRefreshToken()
        {
            var random = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(random);
        }

        public async Task DeleteRefreshToken(string userId)
        {
            var refreshToken = await _teamDbContext.RefreshTokens.Where(rt => rt.UserId == userId).FirstOrDefaultAsync();
            if(refreshToken is null)
            {
                return;
            }
            else
            {
                _teamDbContext.RefreshTokens.Remove(refreshToken);
                await _teamDbContext.SaveChangesAsync();
                _logger.LogInformation("Deleted refresh token");
            }
        }

        public async Task<string> DeleteAndGenerateRefreshToken(string userId)
        {
            await DeleteRefreshToken(userId);
            var token =  GenerateRefreshToken();
            await _teamDbContext.RefreshTokens.AddAsync(new RefreshToken
            {
                UserId = userId,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddDays(2),
                Created = DateTime.UtcNow,
                Revoked = false
            });
            await _teamDbContext.SaveChangesAsync();
            return token;
        }

        public async Task<RefreshResponseDto> RefreshAsync(string refreshToken)
        {
            var storedtoken = await _teamDbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
            Console.WriteLine(storedtoken);
            if (storedtoken is null || storedtoken.IsExpired == true || storedtoken.ExpiresAt <= DateTime.UtcNow)
            {
                throw new Exception("Invalid or expired token");
            }
            var userId = storedtoken.UserId ?? throw new Exception("Token does not match user");
            var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("Invalid user");
            storedtoken.Revoked = true;
            _teamDbContext.RefreshTokens.Update(storedtoken);
            await _teamDbContext.SaveChangesAsync();
            var newRefreshToken = await DeleteAndGenerateRefreshToken(userId);
            var newAccessToken = await GenerateAccessToken(user); 
            var Newtoken = new RefreshToken
            {
                Created = DateTime.UtcNow,
                Revoked = false,
                ExpiresAt = DateTime.UtcNow.AddDays(3),
                Token = newRefreshToken,
                UserId = userId
            };
            await _teamDbContext.RefreshTokens.AddAsync(Newtoken);
            await _teamDbContext.SaveChangesAsync();
            _logger.LogInformation("Generated Refresh Token - {UserEmail}", user.Email);
            return (new RefreshResponseDto { RefreshToken = newRefreshToken, AccessToken = newAccessToken });
        }

        public async Task<LoginResponse> LoginUser(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email) ?? throw new KeyNotFoundException("Invalid account");
            if (!user.IsActive) throw new UnauthorizedAccessException("This account has been deactivated");
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                throw new UnauthorizedAccessException("Invalid username or password.");
            var role = await _userManager.GetRolesAsync(user);
            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(3)
            };
            var accessToken = await GenerateAccessToken(user);
            var refreshToken = await DeleteAndGenerateRefreshToken(user.Id);
            var fullName = $"{user.FirstName} {user.LastName}";
            var department = await _teamDbContext.Departments.Where(d => d.Id == user.DepartmentId).Select(d => d.DepartmentName).FirstOrDefaultAsync();
            if (department == null) throw new KeyNotFoundException("Failed to locate department");
            var email = user.Email;
            _logger.LogInformation("Sucessful Login: Email - {Email}, {Time}", email, DateTime.UtcNow);
            return new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                CookieOptions = options,
                Role = role.FirstOrDefault() ?? string.Empty,
                Email = email ?? throw new KeyNotFoundException("Failed to locate email"),
                FullName = fullName,
                Department = department
            };
            
        }

        public async Task UserForgotPassword(string email)
        {
            var user = await _userManager.FindByEmailAsync(email) ?? throw new KeyNotFoundException("User with this email does not exist");
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _backgroundTaskQueue.QueueAsync(async (serviceProvider, ct) =>
            {
                var emailService = serviceProvider.GetService<IEmailService>() ?? throw new Exception("EmailService not configured");
                await emailService.SendForgotPasswordUrl(email, resetToken, user.FirstName, ct);
            });
        }

        public async Task ResetPassword(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email) ?? throw new KeyNotFoundException("Invalid email");
            if (string.IsNullOrEmpty(dto.resetToken)) throw new ArgumentException("Invalid/expores token");

            if(dto.NewPassword.Trim() != dto.ConfirmNewPassword.Trim())
            {
                throw new ArgumentException("Password inputs must match");
            }
            var result = await _userManager.ResetPasswordAsync(user, dto.resetToken, dto.NewPassword);
            if (!result.Succeeded) {
                var errors = string.Join(",", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                throw new InvalidOperationException(errors);
            }
        }
    }
}