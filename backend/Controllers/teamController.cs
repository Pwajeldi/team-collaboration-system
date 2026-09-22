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
        private readonly IConfiguration _configuration;

        public teamController(TeamDbContext context, 
            ITeamMemberService service, UserManager<TeamMember> userManager,
            IConnectionManager connectionManager, IConfiguration configuration
            )
        {
            _context = context;
            _service = service;
            _userManager = userManager;
            _connectionManager = connectionManager;
            _configuration = configuration;
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetMembers([FromQuery] MemberQueryParameters? filter, int page, int pageSize)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;
            var isAdmin = User.IsInRole(Roles.Admin);
            var query = _userManager.Users.Include(m => m.Department).ApplyMemberQueryFilters(filter).OrderBy(m => m.Email);
            if (!isAdmin)
            {
                query = query.Where(u => u.IsActive).OrderBy(m => m.Email);
            }
            
            var totalMembers = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalMembers/(double)pageSize);
            var pagedMembers = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var memberIds = pagedMembers.Select(m => m.Id).ToList();
            if (page > totalPages && totalPages > 0) page = totalPages;
            var roleAssignments = await (
                from ur in _context.UserRoles
                join r in _context.Roles on ur.RoleId equals r.Id
                where memberIds.Contains(ur.UserId)
                select new { ur.UserId, RoleName = r.Name! }
            ).ToListAsync();

            var rolesByUser = roleAssignments
                .GroupBy(x => x.UserId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.RoleName.ToLowerInvariant()).ToList());

            var items = pagedMembers.Select(m =>
            {
                var userRoles = rolesByUser.GetValueOrDefault(m.Id, []);
                return new GetMemberResponse
                {
                    MemberId = m.Id,
                    FirstName = m.FirstName,
                    LastName = m.LastName,
                    Email = m.Email!,
                    DateJoined = m.DateJoined,
                    JobTitle = m.JobTitle!,
                    Department = m.Department.DepartmentName,
                    DepartmentId = m.DepartmentId,
                    PrimaryRole = userRoles.FirstOrDefault(r => Roles.PrimaryRoles.Contains(r)) ?? string.Empty,
                    SecondaryRoles = userRoles.Where(r => Roles.SecondaryRoles.Contains(r)).ToList(),
                    IsActive = m.IsActive,
                };
            }).ToList();

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
            var userRoles = (await _userManager.GetRolesAsync(member)).Select(r => r.ToLowerInvariant()).ToList();
            var response = new GetMemberResponse
            {
                FirstName = member.FirstName,
                LastName = member.LastName,
                MemberId = member.Id,
                Email = member.Email!,
                DateJoined = member.DateJoined,
                JobTitle = member.JobTitle!,
                Department = member.Department.DepartmentName,
                PrimaryRole = userRoles.FirstOrDefault(r => Roles.PrimaryRoles.Contains(r)) ?? string.Empty,
                SecondaryRoles = userRoles.Where(r => Roles.SecondaryRoles.Contains(r)).ToList(),
                ProfilePictureUrl = string.Empty, // I'll get back to you
                IsActive = member.IsActive,
            };
            return Ok(response);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("create")]
        public async Task<IActionResult> NewMember(CreateMemberDto dto)
        {
            try
            {
                await _service.CreateNewMember(dto);
                return Created();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
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
            if (dto.PrimaryRole is null)
            {
                return BadRequest("User must have a primary role");
            }
            var primaryRole = dto.PrimaryRole.Trim().ToLowerInvariant();
            if (!Roles.PrimaryRoles.Contains(primaryRole)) return BadRequest("Invalid primary role");
            var currentUserRoles = await _userManager.GetRolesAsync(member);
            var currentPrimaryRole = currentUserRoles.FirstOrDefault(role => Roles.PrimaryRoles.Contains(role));
            if(currentPrimaryRole != primaryRole)
            {
                if(currentPrimaryRole is not null)
                {
                    await _userManager.RemoveFromRoleAsync(member, currentPrimaryRole);
                }
                await _userManager.AddToRoleAsync(member, primaryRole);
            }
            var secondaryRoles = dto.SecondaryRoles.Select(r => r.Trim().ToLowerInvariant()).Distinct().ToList();
            if(secondaryRoles.Any(role => !Roles.SecondaryRoles.Contains(role)))
            {
                return BadRequest("One or more secondary roles are invalid");
            }
            var currentSecondaryRoles = currentUserRoles.Where(role => Roles.SecondaryRoles.Contains(role)).ToHashSet();
            var desiredSecondaryRoles = secondaryRoles.ToHashSet();
            var rolesToRemove = currentSecondaryRoles.Except(desiredSecondaryRoles);
            var rolesToAdd = desiredSecondaryRoles.Except(currentSecondaryRoles);
            foreach(var role in rolesToRemove)
            {
                await _userManager.RemoveFromRoleAsync(member, role);
            }
            foreach(var role in rolesToAdd)
            {
                await _userManager.AddToRoleAsync(member, role);
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

        [Authorize(Roles = Roles.Admin)]
        [HttpDelete("deactivate/{userid}")]
        public async Task<IActionResult> DeactivateUser(string userId)
        {
            try
            {
                await _service.DeactivateUser(userId);
                return Ok("User has been deactivated");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPut("activate/{userid}")]
        public async Task<IActionResult> ActivateUser(string userId)
        {
            try
            {
                await _service.ActivateUser(userId);
                return Ok("User has been made active");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
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
                    SenderName = m.Sender != null ? $"{m.Sender.FirstName} {m.Sender.LastName}" : "Deleted User",
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
            var devUrl = _configuration["CloudflareR2:DevelopmentUrl"];
            if (devUrl is null) return BadRequest("Dev url not configured");
            var query = _userManager.Users.ApplyMemberQueryFilters(queryParameters).OnlyActive()
                .Select(u => new GetMemberListDto
                {
                    FullName = $"{u.FirstName} {u.LastName}",
                    UserId = u.Id,
                    Email = u.Email,
                    UnreadMessages = _context.Messages.Count(m => m.RecipientId == callerId && 
                        m.SenderId == u.Id && !m.IsRead),
                    ProfilePictureUrl = u.ProfilePictureBlobName != null ? $"{devUrl}/{u.ProfilePictureBlobName}" : null,
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
