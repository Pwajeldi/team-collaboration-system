using backend.Data;
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
    public class testEmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly UserManager<TeamMember> _userManager;
        private readonly TeamDbContext _context;

        public testEmailController(IEmailService emailService, UserManager<TeamMember> userManager, TeamDbContext context)
        {
            _emailService = emailService;
            _userManager = userManager;
            _context = context;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> TestMail()
        {
            var user = await _userManager.GetUserAsync(User);
            var Event = await _context.Events.Include(e => e.Attendees).FirstOrDefaultAsync(e => e.Attendees.Any(ea => ea.UserId == user!.Id));
            try
            {
                await _emailService.SendEmailToNewUser("pwajeldi900@gmail.com", "Joshua", "resetMyPAssword");
                await _emailService.SendEventInvite(user!, Event!, true);
                return Ok("mail sent");
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
                
        }
    }
}
