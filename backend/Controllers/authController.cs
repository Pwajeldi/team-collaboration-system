using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class authController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<TeamMember> _userManager;

        public authController(IAuthService authService, RoleManager<IdentityRole> roleManager, UserManager<TeamMember> userManager)
        {
            _authService = authService;
            _roleManager = roleManager;
            _userManager = userManager;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var loginResponse = await _authService.LoginUser(dto);
                Response.Cookies.Append("refreshToken", loginResponse.RefreshToken, loginResponse.CookieOptions!);
                return Ok(new
                {
                    token = loginResponse.AccessToken,
                    role = loginResponse.Role,
                    email = loginResponse.Email,
                    fullName = loginResponse.FullName,
                    department = loginResponse.Department,
                    profilePictureUrl = loginResponse.ProfilePictureUrl,
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"] ?? throw new Exception("Refresh token not found");
                var newTokens = await _authService.RefreshAsync(refreshToken);
                var options = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddDays(3)
                };
                Response.Cookies.Append("refreshToken", newTokens.RefreshToken, options);
                return Ok(newTokens.AccessToken);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrWhiteSpace(email)) return BadRequest("Email not provided");
            try
            {
                await _authService.UserForgotPassword(email);
                return Ok("Check your inbox for the password reset link");
            }
            catch (KeyNotFoundException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }    
        }

        [HttpPost("resetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody]ResetPasswordDto dto)
        {
            try
            {
                await _authService.ResetPassword(dto);
                return Ok("Password has been setup successfully");
            }
            catch (KeyNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleManager.Roles.Select(r => new
            {
                r.Id,
                r.Name
            }).ToListAsync();
            return Ok(roles);
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPost("users/{userID}/assign-role/{role}")]
        public async Task<IActionResult> AssignRole(string userID, string role)
        {
            var newRole = role.Trim().ToLowerInvariant();
            if(!Roles.SecondaryRoles.Contains(newRole))
            {
                return BadRequest("Invalid secondary role");
            }
            var user = await _userManager.FindByIdAsync(userID);
            if (user is null) return NotFound("User not found");
            var alreadyHasRole = await _userManager.IsInRoleAsync(user, newRole);
            if (alreadyHasRole) return BadRequest("User already has this role");
            var result = await _userManager.AddToRoleAsync(user, newRole);
            if (!result.Succeeded) return BadRequest(result.Errors);
            return Ok($"Role '{role}' assigned successfully");
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("users/{userId}/roles/{role}")]
        public async Task<IActionResult> RemoveRole(string userId, string role)
        {
            role = role.Trim().ToLowerInvariant();
            if (!Roles.SecondaryRoles.Contains(role))
            {
                return BadRequest("Invalid secondary role");
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user is null) return NotFound("User not found");
            var alreadyHasRole = await _userManager.IsInRoleAsync(user, role);
            if (!alreadyHasRole) return BadRequest("User does not have this role");
            var result = await _userManager.RemoveFromRoleAsync(user, role);
            if (!result.Succeeded) return BadRequest(result.Errors);
            return Ok($"Role '{role}' removed successfully");
        }
    }
}
