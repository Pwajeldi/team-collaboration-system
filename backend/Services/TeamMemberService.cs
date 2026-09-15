using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface ITeamMemberService
    {
        Task CreateNewMember(CreateMemberDto dto);
        Task<GetMemberResponse> GetMember(int id);
        Task GetMembers(GetMembersDto dto);
        Task DeleteMember(string id);
        Task DeactivateUser(string userId);
    }
    public class TeamMemberService : ITeamMemberService
    {
        private readonly TeamDbContext _context;
        private readonly ILogger<TeamMemberService> _logger;
        private readonly IBackgroundTaskQueue _queue;
        private readonly UserManager<TeamMember> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        private readonly string[] validImageFormats = { ".jpg", ".jpeg", ".png", ".bmp", ".webp" };
        private readonly long maxImageSize = 5 * 1024 * 1024; // 5 MB
        public TeamMemberService(TeamDbContext context, 
            ILogger<TeamMemberService> logger, 
            UserManager<TeamMember> userManager, 
            RoleManager<IdentityRole> roleManager,
            IBackgroundTaskQueue queue)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
            _roleManager = roleManager;
            _queue = queue;
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
            var teamMember = new TeamMember
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                JobTitle = dto.JobTitle,
                DateJoined = DateTime.UtcNow,
                DepartmentId = dto.DepartmentId,
                IsActive = true,
            };

            var creatingManager = string.Equals(Roles.Manager, dto.Role, StringComparison.OrdinalIgnoreCase);
            var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == dto.DepartmentId);
            var currentManagerId = department!.ManagerId;
                
            try
            {
                var result = await _userManager.CreateAsync(teamMember);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(teamMember, dto.Role ?? Roles.Regular);
                    if (creatingManager)
                    {
                        if (currentManagerId != null)
                        {
                            throw new InvalidOperationException("Manager already exists for the specified department");
                        }
                        else
                        {
                            department.ManagerId = teamMember.Id;
                        }
                    }
                    await _context.SaveChangesAsync();

                    var userProfile = new UserProfile
                    {
                        UserId = teamMember.Id,
                        Role = dto.Role ?? Roles.Regular,
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating team member.");
                throw new Exception("An error occurred while creating the team member.");
            }

        }

        public async Task DeactivateUser(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("User does not exist");
            user.IsActive = false;
            user.UserName = $"deleted_{user.Email}";
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
