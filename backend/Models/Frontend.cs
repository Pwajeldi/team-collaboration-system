namespace backend.Models
{
    public class FrontendOptions
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string CalendarPath { get; set; } = "/calendar";
        public string LoginPath { get; set; } = "/login";
        public string SignUpPath { get; set; } = "/account-setup";
    }
}
