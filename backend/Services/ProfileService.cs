using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IProfileService
    {
        Task<UserProfileResponse> GetMyProfile(string userId);
        Task DeleteProfile(string userId);
        Task<UserProfileResponse> UpdateMyProfile(string userId, UpdateProfileDto dto);
        Task ChangePassword(string userId, ChangePasswordDto dto);
    }
    public class ProfileService : IProfileService
    {
        private readonly TeamDbContext _context;
        private readonly UserManager<TeamMember> _userManager;
        private readonly ILogger<ProfileService> _logger;
        private readonly IConfiguration _configuration;

        public ProfileService(TeamDbContext context, UserManager<TeamMember> userManager, 
            ILogger<ProfileService> logger, IConfiguration configuration)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task ChangePassword(string userId, ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId) ?? throw new KeyNotFoundException("Invalid userId");
            if(dto.NewPassword.Trim() != dto.ConfirmNewPassword.Trim())
            {
                throw new InvalidOperationException("New password inputs do not match");
            }
            var result = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException("Incorrect password");
            }
            _logger.LogInformation("Successful password update: {Email}", user.Email);
        }

        public async Task DeleteProfile(string userId)
        {
            throw new NotImplementedException();
        }

        public async Task<UserProfileResponse> GetMyProfile(string userId)
        {
            var devUrl = _configuration["CloudflareR2:DevelopmentUrl"] ?? throw new Exception("DevUrl not configured");
            var profile = await _context.UserProfiles.Where(p => p.UserId == userId)
                .Select(p => new UserProfileResponse
                {
                    FirstName = p.FirstName,
                    LastName = p.LastName,
                    PhoneNumber = p.PhoneNumber,
                    Bio = p.Bio,
                    DateJoined = p.DateJoined,
                    DateOfBirth = p.DateOfBirth,
                    Email = p.Email,
                    DepartmentId = p.DepartmentId,
                    JobTitle = p.JobTitle,
                    ProfilePictureUrl = $"{devUrl}/{p.ProfilePictureBlobName}",
                    FacebookUrl = p.FacebookUrl,
                    GithubUrl = p.GithubUrl,
                    LinkedInUrl = p.LinkedInUrl,
                    Role = p.Role,
                    Xurl = p.Xurl,
                })
                .FirstOrDefaultAsync();
            if(profile is null)
            {
                var member = await _userManager.FindByIdAsync(userId);
                if (member is not null)
                {
                    var roles = await _userManager.GetRolesAsync(member);
                    var newProfile = new UserProfile
                    {
                        FirstName = member.FirstName,
                        LastName = member.LastName,
                        Email = member.Email!,
                        DepartmentId = member.DepartmentId,
                        DateJoined = member.DateJoined,
                        JobTitle = member.JobTitle!,
                        UserId = userId,
                        ProfilePictureBlobName = member.ProfilePictureBlobName,
                        Role = roles.FirstOrDefault() ?? ""
                    };
                    await _context.UserProfiles.AddAsync(newProfile);
                    await _context.SaveChangesAsync();
                }
            }
            return profile!;
        }

        public async Task<UserProfileResponse> UpdateMyProfile(string userId, UpdateProfileDto dto)
        {
            var profile = await _context.UserProfiles.Where(p => p.UserId == userId).FirstOrDefaultAsync()
                ?? throw new KeyNotFoundException("User's profile does not exist");

            if(dto.PhoneNumber is not null && dto.PhoneNumber.Length == 11)
            {
                profile.PhoneNumber = dto.PhoneNumber;
            }
            if(dto.LinkedInUrl is not null && dto.LinkedInUrl.Contains("linkedin.com"))
            {
                profile.LinkedInUrl = dto.LinkedInUrl;
            }
            if (dto.GithubUrl is not null && dto.GithubUrl.Contains("github.com"))
            {
                profile.GithubUrl = dto.GithubUrl;
            }
            if (dto.FacebookUrl is not null && dto.FacebookUrl.Contains("facebook.com"))
            {
                profile.FacebookUrl = dto.FacebookUrl;
            }
            if(dto.Bio is not null)
            {
                profile.Bio = dto.Bio;
            }
            if(dto.Xurl is not null && dto.Xurl.Contains("x.com"))
            {
                profile.Xurl = dto.Xurl;
            }
            if (dto.DateOfBirth.HasValue)
            {
                profile.DateOfBirth = dto.DateOfBirth.Value;
            }
            await _context.SaveChangesAsync();
            var updatedProfile = new UserProfileResponse
            {
                Bio = profile.Bio,
                FirstName = profile.FirstName,
                LastName = profile.LastName,
                DateJoined = profile.DateJoined,
                DateOfBirth = profile.DateOfBirth,
                DepartmentId = profile.DepartmentId,
                Email = profile.Email,
                FacebookUrl = profile.FacebookUrl,
                GithubUrl = profile.GithubUrl,
                LinkedInUrl = profile.LinkedInUrl,
                PhoneNumber = profile.PhoneNumber,
                Role = profile.Role,
                JobTitle = profile.JobTitle,
                Xurl = profile.Xurl,
                ProfilePictureUrl = profile.ProfilePictureBlobName,
            };
            return updatedProfile;
        }
    }
}
