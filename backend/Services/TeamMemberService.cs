using backend.Data;
using backend.Dtos;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MimeKit.Encodings;

namespace backend.Services
{
    public interface ITeamMemberService
    {
        Task CreateNewMember(CreateMemberDto dto);
        Task<GetMemberResponse> GetMember(int id);
        Task GetMembers(GetMembersDto dto);
        Task DeleteMember(string id);
        Task DeactivateUser(string userId);
        Task ActivateUser(string userId);
    }
    public class TeamMemberService : ITeamMemberService
    {
        private readonly TeamDbContext _context;
        private readonly ILogger<TeamMemberService> _logger;
        private readonly IBackgroundTaskQueue _queue;
        private readonly UserManager<TeamMember> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConnectionManager _connectionManager;
        private readonly IHubContext<ChatHub> _hub;

        private readonly string[] validImageFormats = { ".jpg", ".jpeg", ".png", ".bmp", ".webp" };
        private readonly long maxImageSize = 5 * 1024 * 1024; // 5 MB
        public TeamMemberService(TeamDbContext context, 
            ILogger<TeamMemberService> logger, 
            UserManager<TeamMember> userManager, 
            RoleManager<IdentityRole> roleManager,
            IBackgroundTaskQueue queue, IConnectionManager connectionManager, IHubContext<ChatHub> hub)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _roleManager = roleManager;
            _queue = queue;
            _hub = hub;
            _connectionManager = connectionManager;
        }
        public async Task CreateNewMember(CreateMemberDto dto)
        {
            if(await _userManager.FindByEmailAsync(dto.Email) != null)
            {
                throw new Exception("A user with this email already exists.");
            };
            if (string.IsNullOrEmpty(dto.FirstName) || string.IsNullOrEmpty(dto.LastName))
            {
                throw new Exception("All required fields must be filled.");
            }
            if (dto.PrimaryRole is null)
            {
                throw new ArgumentException("User must have a primary role");
            }
            var secondaryRoles = dto.SecondaryRoles.Select(r => r.Trim().ToLowerInvariant()).Distinct().ToList();
            if (secondaryRoles.Any(role => !Roles.SecondaryRoles.Contains(role)))
            {
                throw new ArgumentException("One or more secondary roles are invalid");
            }
            var primaryRole = dto.PrimaryRole.Trim().ToLowerInvariant();
            if (!Roles.PrimaryRoles.Contains(primaryRole)) throw new ArgumentException("Invalid primary role");
            var teamMember = new TeamMember
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                JobTitle = dto.JobTitle,
                DateJoined = DateTime.UtcNow,
                DepartmentId = dto.Department,
                IsActive = true,
            };
                
            try
            {
                var creatingManager = string.Equals(Roles.Manager, primaryRole, StringComparison.OrdinalIgnoreCase);
                var department = await _context.Departments
                   .FirstOrDefaultAsync(d => d.Id == dto.Department) ?? throw new KeyNotFoundException("Department does not exist");

                if (creatingManager)
                {
                    if (!string.IsNullOrEmpty(department.ManagerId))
                    {
                        throw new InvalidOperationException("Manager already exists for the specified department");
                    }
                    else
                    {
                        department.ManagerId = teamMember.Id;
                    }
                }

                var result = await _userManager.CreateAsync(teamMember);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(teamMember, primaryRole ?? Roles.Regular);
            
                    foreach(var role in secondaryRoles)
                    {
                        await _userManager.AddToRoleAsync(teamMember, role);
                    }

                    await _context.SaveChangesAsync();

                    var userProfile = new UserProfile
                    {
                        UserId = teamMember.Id,
                        Role = primaryRole ?? Roles.Regular,
                        FirstName = teamMember.FirstName,
                        LastName= teamMember.LastName,
                        Email = teamMember.Email,
                        DateJoined = teamMember.DateJoined,
                        DepartmentId = teamMember.DepartmentId,
                        JobTitle = teamMember.JobTitle!,
                        IsActive = teamMember.IsActive,
                    };
                    _context.UserProfiles.Add(userProfile);
                    await _context.SaveChangesAsync();

                    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(teamMember);

                    await _queue.QueueAsync(async (service, ct) =>
                    {
                        var emailService = service.GetRequiredService<IEmailService>();
                        try
                        {
                            await emailService.SendEmailToNewUser(teamMember.Email, $"{teamMember.FirstName} {teamMember.LastName}", resetToken, ct);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to send email to new user - {Email}", dto.Email);
                        }
                    });
                }       
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError(ex, "Error creating team member. {Error}, dto.deptId: {dtoDept}", ex.Message, dto.Department);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating team member.");
                throw;
            }

        }

        public async Task DeactivateUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User does not exist");
            if (!user.IsActive) throw new Exception("User is currently deactivated");
            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new Exception("Failed to deactivate user");
            }
            var connections = _connectionManager.GetConnections(userId);
            foreach (var connectionId in connections)
            {
                await _hub.Clients.Client(connectionId).SendAsync("ForceLogout");
            }
            user.UserName = $"deleted_{user.Email}";
        }

        public async Task ActivateUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User does not exist");
            if (user.IsActive) throw new Exception("User is currently active");
            user.IsActive = true;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new Exception("Failed to activate user");
            }
            user.UserName = $"{user.Email}";
        }

        public async Task DeleteMember(string id)
        {
            try
            {
                var member = await _userManager.FindByIdAsync(id) 
                    ?? throw new KeyNotFoundException("User does not exist");
                await _context.Messages
                    .Where(m => m.SenderId == member.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(m => m.SenderId, (string?)null));

                await _context.Messages
                    .Where(m => m.RecipientId == member.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(m => m.RecipientId, (string?)null));

                await _context.DepartmentMessages
                    .Where(dm => dm.SenderId == member.Id)
                    .ExecuteUpdateAsync(s => s.SetProperty(dm => dm.SenderId, (string?)null));

                await _context.Events
                    .Where(e => e.OrganizerId == member.Id)
                    .ExecuteUpdateAsync(e => e.SetProperty(e => e.OrganizerId, (string?)null));

                await _context.Departments
                    .Where(d => d.ManagerId == member.Id)
                    .ExecuteUpdateAsync(e => e.SetProperty(e => e.ManagerId, (string?)null));


                var result = await _userManager.DeleteAsync(member);
                if (result.Succeeded)
                {
                    _logger.LogInformation("User deleted - {User}", member.Email);
                }
                else
                {
                    throw new Exception("Unable to delete user");
                }              
            }
            catch(KeyNotFoundException ex)
            {
                _logger.LogError("Error locating user - {Message}", ex.Message);
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError("Error deleting user - {Message}", ex.InnerException);
                throw;
            }
        }

        public Task<GetMemberResponse> GetMember(int id)
        {
            throw new NotImplementedException();
        }

        public async Task GetMembers(GetMembersDto sdto)
        {
            throw new NotImplementedException();
        }
    }
}
