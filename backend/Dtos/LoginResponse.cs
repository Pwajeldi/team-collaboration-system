namespace backend.Dtos
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public CookieOptions? CookieOptions { get; set; }
        public List<string> Role { get; set; } = [];
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
    }
}
