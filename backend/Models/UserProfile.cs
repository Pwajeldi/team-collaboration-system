namespace backend.Models
{
    public class UserProfile
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? UserId { get; set; } = string.Empty;
        public TeamMember TeamMember { get; set; } = null!;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string Role {  get; set; } = string.Empty;
        public string JobTitle {  get; set; } = string.Empty;
        public int DepartmentId {  get; set; }
        public DateTime DateJoined { get; set; }
        public string? Bio {  get; set; }
        public string? LinkedInUrl { get; set; }
        public string? GithubUrl { get; set; }
        public string? Xurl { get; set; }
        public string? FacebookUrl { get; set; }
        public string? ProfilePictureBlobName { get; set; }
        public bool IsActive { get; set; }
    }
}
