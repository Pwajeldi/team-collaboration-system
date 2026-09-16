using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class dashboardController : ControllerBase
    {
        private readonly UserManager<TeamMember> _userManager;
        private readonly IDashboardService _dashboardService;

        public dashboardController(UserManager<TeamMember> userManager, IDashboardService dashboardService)
        {
            _userManager = userManager;
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard([FromQuery]string timeZone)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null) return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            try
            {
                if (roles.Contains(Roles.Manager))
                {
                    var managerDashboardResponse = await _dashboardService.GetManagerDashboard(user, timeZone);
                    return Ok(new {managerDashboardResponse});
                }

                if (roles.Contains(Roles.Admin))
                {
                    var adminDashboardResponse = await _dashboardService.GetAdminDashboard(user, timeZone);
                    return Ok(new {adminDashboardResponse});
                }

                var regularDashboardResponse = await _dashboardService.GetRegularDashboard(user, timeZone);
                return Ok(new {regularDashboardResponse});
            }
            catch(KeyNotFoundException kx)
            {
                return NotFound(kx.Message);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
