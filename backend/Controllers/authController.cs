using backend.Dtos;
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

        public authController(IAuthService authService, RoleManager<IdentityRole> roleManager)
        {
            _authService = authService;
            _roleManager = roleManager;
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
                    department = loginResponse.Department
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
    }
}
