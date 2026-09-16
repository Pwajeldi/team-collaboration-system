using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using static backend.Controllers.teamController;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class departmentController : ControllerBase
    {
        private readonly TeamDbContext _context;
        private readonly UserManager<TeamMember> _userManager;

        public departmentController(TeamDbContext context, UserManager<TeamMember> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateDepartment([Required]string department)
        {
            if (await _context.Departments.AnyAsync(d => d.DepartmentName == department.Trim()))
            {
                return BadRequest($"{department} department already exists");
            };
            var newDepartment = new Department
            {
                DepartmentName = department.Trim(),
            };
            await _context.Departments.AddAsync(newDepartment);
            await _context.SaveChangesAsync();
            return Created();
        }

        [HttpGet("get")]
        public async Task<IActionResult> GetDepartments()
        {
            var departments = await _context.Departments.Select(d => new GetDepartmentResponse
            {
                DepartmentId = d.Id,
                DepartmentName = d.DepartmentName
            }).ToListAsync();
            return Ok(departments);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("delete/{departmentId}")]
        public async Task<IActionResult> DeleteDepartment(int departmentId)
        {
            var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == departmentId);
            if (department is null) return NotFound("No department matches the description");
            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();
            return NoContent();
        }


        [HttpGet("messages")]
        public async Task<IActionResult> LoadMessages([FromQuery] string? encodedCursor)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return Unauthorized();
            var pageSize = 40;

            var query = _context.DepartmentMessages
                .Include(m => m.Sender)
                .Include(m => m.DepartmentAttachments)
                .Where(dm => dm.DepartmentId == user.DepartmentId)
                .AsNoTracking()
                .AsQueryable();

            if (encodedCursor is not null)
            {
                var cursor = DecodeCursor(encodedCursor);
                query = query.Where(dm => (dm.SentAt < cursor.SentAt) || (dm.SentAt == cursor.SentAt && dm.Id < cursor.Id));
            }

            var messages = await query
                .OrderByDescending(dm => dm.SentAt).ThenByDescending(dm => dm.Id)
                .Select(dm => new DepartmentMessageResponse
                {
                    MessageId = dm.Id,
                    SenderId = dm.SenderId,
                    SenderName = dm.Sender != null ? dm.Sender.FirstName : "Deleted User",
                    Content = dm.Message,
                    SentDate = dm.SentAt,
                    IsRead = dm.IsRead,
                    IsDelivered = dm.IsDelivered,
                    Attachments = dm.DepartmentAttachments.Select(at => new AttachmentResponse
                    {
                        Id = at.Id,
                        BlobName = at.BlobName,
                        ContentType = at.ContentType,
                        FileName = at.FileName,
                        FileSizeBytes = at.FileSizeBytes,
                    }).ToList(),
                })
                .Take(pageSize + 1)
                .ToListAsync();
            bool hasMore = messages.Count > pageSize;
            if (hasMore) messages.RemoveAt(messages.Count - 1);
            string? nextCursor = hasMore && messages.Count > 0
                ? EncodeCursor(new MessageCursor(messages[^1].SentDate, messages[^1].MessageId))
                : null;
            return Ok(new { messages, nextCursor });
        }
    }
}
