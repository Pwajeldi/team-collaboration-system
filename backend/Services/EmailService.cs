using backend.Models;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;

namespace backend.Services
{
    public interface IEmailService
    {
        Task SendEmailToNewUser(string recipientEmail, string recipientName, string resetToken, CancellationToken ct = default);
        Task SendEventInvite(TeamMember recipient, Event calendarEvent, bool hadOverlapAtCreation, CancellationToken ct = default);
        Task SendEventCancelledEmail(TeamMember recipient, string eventTitle, DateTime eventStart, CancellationToken ct = default);
        Task SendForgotPasswordUrl(string userEmail, string resetToken, string userName, CancellationToken ct = default);
    }
    public class EmailService : IEmailService
    {
        private readonly MailCreds _mailCreds;
        private readonly FrontendOptions _frontend;
        private readonly ILogger<IEmailService> _logger;

        public EmailService(
            IOptions<MailCreds> mailOptions,
            IOptions<FrontendOptions> frontendOptions,
            ILogger<IEmailService> logger)
        {
            _mailCreds = mailOptions.Value;
            _frontend = frontendOptions.Value;
            _logger = logger;
        }

        public async Task SendEmailToNewUser(string recipientEmail, string recipientName, string resetToken, CancellationToken ct = default)
        {
            var signUpUrl = BuildUrl(_frontend.SignUpPath).TrimEnd("/");
            var resetUrl = $"{signUpUrl}" +
                           $"?email={Uri.EscapeDataString(recipientEmail!)}" +
                           $"&token={Uri.EscapeDataString(resetToken)}";

            var mail = BuildMessage(
                recipientEmail,
                recipientName,
                subject: "Welcome to the team",
                body:
                    $"Hi {recipientName},\n\n" +
                    "Your account has been created!.\n"+
                    "Click the link below to complete your account setup:\n\n" +
                    $"{resetUrl}\n\n" +
                    "Welcome aboard!"
            );

            await SendAsync(mail, ct);
        }



        public async Task SendEventInvite(TeamMember recipient, Event calendarEvent, bool hadOverlapAtCreation, CancellationToken ct = default)
        {
            var eventUrl = BuildUrl(_frontend.CalendarPath, $"eventId={calendarEvent.Id}");
            var overlapNote = hadOverlapAtCreation
                ? "\nNote: this overlaps with another event already on your calendar.\n"
                : "";

            var mail = BuildMessage(
                recipient.Email!,
                $"{recipient.FirstName} {recipient.LastName}",
                subject: $"You're invited: {calendarEvent.Title}",
                body:
                    $"Hi {recipient.FirstName},\n\n" +
                    $"You've been added to \"{calendarEvent.Title}\".\n" +
                    $"When: {calendarEvent.Start:f} - {calendarEvent.End:t}\n" +
                    (string.IsNullOrWhiteSpace(calendarEvent.Location) ? "" : $"Where: {calendarEvent.Location}\n") +
                    overlapNote +
                    $"\nView it here:\n{eventUrl}"
            );

            await SendAsync(mail, ct);
        }

        private static MimeMessage BuildMessage(string toEmail, string toName, string subject, string body)
        {
            var mail = new MimeMessage();
            mail.Subject = subject;
            mail.To.Add(new MailboxAddress(toName, toEmail));
            mail.Body = new TextPart("plain") { Text = body };
            return mail;
        }

        private string BuildUrl(string path, string? query = null)
        {
            var url = $"{_frontend.BaseUrl.TrimEnd('/')}{path}";
            return string.IsNullOrEmpty(query) ? url : $"{url}?{query}";
        }

        private async Task SendAsync(MimeMessage mail, CancellationToken ct)
        {
            var senderName = _mailCreds.SenderName;
            var senderAddress = _mailCreds.SenderAddress;
            var host = _mailCreds.Host;
            var primaryPort = _mailCreds.PrimaryPort;
            var userName = _mailCreds.Username;
            var password = _mailCreds.Password;

            mail.From.Add(new MailboxAddress(senderName, senderAddress));

            const int fallbackPort = 465;
            using var client = new SmtpClient();

            try
            {
                await client.ConnectAsync(host, primaryPort, SecureSocketOptions.StartTlsWhenAvailable, ct);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SMTP connect failed on port {Port}, retrying on fallback port {FallbackPort}", primaryPort, fallbackPort);
                await client.ConnectAsync(host, fallbackPort, SecureSocketOptions.SslOnConnect, ct);
            }

            try
            {
                await client.AuthenticateAsync(userName, password, ct);
                await client.SendAsync(mail, ct);
                _logger.LogInformation("Email sent to {Recipient}", mail.To);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient}", mail.To);
                throw;
            }
            finally
            {
                if (client.IsConnected)
                    await client.DisconnectAsync(true, ct);
            }
        }

        public async Task SendEventCancelledEmail(TeamMember recipient, string eventTitle, DateTime eventStart, CancellationToken ct = default)
        {
            var calendarUrl = BuildUrl(_frontend.CalendarPath);

            var mail = BuildMessage(
                recipient.Email!,
                $"{recipient.FirstName} {recipient.LastName}",
                subject: $"Cancelled: {eventTitle}",
                body:
                    $"Hi {recipient.FirstName},\n\n" +
                    $"\"{eventTitle}\" (originally scheduled for {eventStart:f}) has been cancelled by the organizer.\n" +
                    $"It's been removed from your calendar.\n\n" +
                    $"View your calendar:\n{calendarUrl}"
            );

            await SendAsync(mail, ct);
        }

        public async Task SendForgotPasswordUrl(string userEmail, string resetToken, string userName, CancellationToken ct = default)
        {
            var resetUrl = $"{_frontend.BaseUrl.TrimEnd("/")}/reset-password" +
                           $"?email={Uri.EscapeDataString(userEmail!)}" +
                           $"&token={Uri.EscapeDataString(resetToken)}"
            ;
            var subject = "Reset Password";
            var body = $"Hello {userName}, \n\n" + 
                "Go to the url below to change your password \n" +
                $"{resetUrl}";
            var mail = BuildMessage(userEmail, userName, subject, body);

            await SendAsync(mail, ct);
        }
    }
}