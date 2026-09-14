using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    
    public class teamController : ControllerBase
    {
        private readonly TeamDbContext _context;
        private readonly ITeamMemberService _service;
        private readonly UserManager<TeamMember> _userManager;
        private readonly IConnectionManager _connectionManager;

        public teamController(TeamDbContext context, 
            ITeamMemberService service, UserManager<TeamMember> userManager,
            IConnectionManager connectionManager
            )
        {
            _context = context;
            _service = service;
            _userManager = userManager;
            _connectionManager = connectionManager;
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetMembers([FromQuery] MemberQueryParameters? filter, int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            var query = _userManager.Users.Include(m => m.Department).ApplyMemberQueryFilters(filter).OrderBy(m => m.Email);
            var totalMembers = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalMembers/(double)pageSize);
            if (page > totalPages && totalPages > 0) page = totalPages;
            var items = await query.Select(m => new GetMemberResponse
            {
                FirstName = m.FirstName,
                LastName = m.LastName,
                MemberId = m.Id,
                Email = m.Email!,
                DateJoined = m.DateJoined,
                JobTitle = m.JobTitle!,
                Department = m.Department.DepartmentName,
                ProfilePictureUrl = m.ProfilePictureUrl ?? "",
            }).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var hasNextPage = page < totalPages;
            var response = new PaginatedResponse<GetMemberResponse>
            {
                Page = page,
                PageSize = pageSize,
                Total = totalMembers,
                TotalPages = totalPages,
                HasNextPage = hasNextPage,
                HasPreviousPage = page > 1,
                NextPage = hasNextPage ? page + 1 : null,
                PreviousPage = page > 1 ? page - 1 : null,
                Items = items
            };
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMember([FromQuery]string id)
        {
            var member = await _userManager.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == id);
            if (member == null) return Unauthorized();
            var response = new GetMemberResponse
            {
                FirstName = member.FirstName,
                LastName = member.LastName,
                MemberId = member.Id,
                Email = member.Email!,
                DateJoined = member.DateJoined,
                JobTitle = member.JobTitle!,
                Department = member.Department.DepartmentName,
                ProfilePictureUrl = member.ProfilePictureUrl ?? string.Empty
            };
            return Ok(response);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> NewMember(CreateMemberDto dto)
        {
            var dept = await _context.Departments.FindAsync(dto.DepartmentId);
            if(dept is null) { return BadRequest("Invalid department"); }
            try
            {
                await _service.CreateNewMember(dto);
                return Created();
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

        [Authorize(Roles = "admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateMember(string id, UpdateMemberDto dto)
        {
            var member = await _userManager.FindByIdAsync(id); if (member == null) return NotFound();

            if (dto.FirstName != null) member.FirstName = dto.FirstName;
            if (dto.LastName != null) member.LastName = dto.LastName;
            if (dto.JobTitle != null) member.JobTitle = dto.JobTitle;
            if (dto.DepartmentId.HasValue) member.DepartmentId = dto.DepartmentId ?? 0;
            if (dto.Role != null)
            {
                var lowercase = dto.Role.ToLower();
                string[] roles = [Roles.Admin, Roles.Manager, Roles.Regular];
                if (!roles.Contains(lowercase))
                {
                   return BadRequest(new { message = "Invalid role" });
                }
                await _userManager.AddToRoleAsync(member, lowercase);
            }

            var result = await _userManager.UpdateAsync(member);
            return result.Succeeded ? Ok() : BadRequest(new { message = "Failed to update member" });
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteMember(string id)
        {
            try
            {
                await _service.DeleteMember(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {   
                return BadRequest(ex.InnerException);
            }
        }

        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages([FromQuery]string otherUserId, [FromQuery]string? encodedCursor)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            int pageSize = 30;
            var query = _context.Messages.AsQueryable();
            query = query.Where(m => (m.SenderId==currentUserId && m.RecipientId==otherUserId) ||
                                        (m.RecipientId==currentUserId && m.SenderId==otherUserId)
            );
            if(encodedCursor is not null)
            {
                var cursor = DecodeCursor(encodedCursor);
                query = query.Where(m => (m.SentAt < cursor.SentAt) || (m.SentAt == cursor.SentAt && m.Id < cursor.Id));
            }

            var messages = await query.Include(m => m.Attachments)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.SentAt)
                .ThenByDescending(m => m.Id)
                .Take(pageSize + 1)
                .Select(m => new MessageResponse
                {
                    MessageId = m.Id,
                    SenderId = m.SenderId,
                    SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                    RecipientId = m.RecipientId,
                    SentDate = m.SentAt,
                    Content = m.Content ?? "",
                    IsRead = m.IsRead,
                    IsDelivered = m.IsDelivered,
                    Attachments = m.Attachments.Select(a => new AttachmentResponse
                    {
                        Id = a.Id,
                        BlobName = a.BlobName,
                        FileName = a.FileName,
                        ContentType = a.ContentType,
                        FileSizeBytes = a.FileSizeBytes,
                    }).ToList()
                })
                .ToListAsync();
            bool hasMore = messages.Count > pageSize;
            if (hasMore) messages.RemoveAt(messages.Count-1);
            string? nextCursor = hasMore && messages.Count > 0
                ? EncodeCursor(new MessageCursor(messages[^1].SentDate, messages[^1].MessageId))
                : null;
            return Ok(new { messages, nextCursor });
        }

        [Authorize]
        [HttpGet("listusers")]
        public async Task<IActionResult> GetUsersToDM([FromQuery]MemberQueryParameters? queryParameters)
        {
            var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (callerId is null) return Unauthorized();
            var query = _userManager.Users.ApplyMemberQueryFilters(queryParameters)
                .Select(u => new GetMemberListDto
                {
                    FullName = $"{u.FirstName} {u.LastName}",
                    UserId = u.Id,
                    Email = u.Email,
                    UnreadMessages = _context.Messages.Count(m => m.RecipientId == callerId && 
                        m.SenderId == u.Id && !m.IsRead)
                });
            var users = await query.ToListAsync();
            return Ok(users);
        }

        [HttpGet("online")]
        public async Task<IActionResult> GetOnlineUsers()
        {
            return Ok(_connectionManager.GetOnlineUserIds());
        }

        public static string EncodeCursor(MessageCursor cursor)
        {
            var json = JsonSerializer.Serialize(cursor);
            var bytes = Encoding.UTF8.GetBytes(json);
            return Convert.ToBase64String(bytes);
        }

        public static MessageCursor DecodeCursor(string encodedCursor)
        {
            try
            {
                var convertedString = Convert.FromBase64String(encodedCursor);
                var json = Encoding.UTF8.GetString(convertedString);
                var deserialized = JsonSerializer.Deserialize<MessageCursor>(json);
                if (deserialized is not null) { return deserialized; }
                else { throw new NullReferenceException("Invalid cursor"); }
            }
            catch (NullReferenceException e) { throw new Exception(e.Message); }//This is a programming war crime lol 🤣 i'll remove it
        }

        public record MessageCursor(DateTime SentAt, long Id);
    }
}
