using Org.BouncyCastle.Tls;

namespace backend.Models
{
    public class MailCreds
    {
        public string SenderName { get; set; } = string.Empty;
        public string SenderAddress { get; set; } = string.Empty;
        public string Host {  get; set; } = string.Empty;
        public int PrimaryPort { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
