using backend.Models;

namespace backend.Dtos
{
    public class UpdateProfileDto
    {
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Bio { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? Xurl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }

    public class UserProfileResponse
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public DateTime DateJoined { get; set; }
        public string? Bio { get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? Xurl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}
