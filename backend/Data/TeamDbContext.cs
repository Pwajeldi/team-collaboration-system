using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class TeamDbContext : IdentityDbContext<TeamMember>
    {
        public TeamDbContext(DbContextOptions<TeamDbContext> options)
            : base(options)
        {
        }
 

        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Messages> Messages { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<DepartmentMessage> DepartmentMessages { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventAttendee> EventAttendees { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<MessageAttachment> MessageAttachments { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<MeetingAttendee> MeetingAttendees { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<TeamMember>(entity =>
            {
                entity.HasOne(e => e.Department)
                .WithMany(e => e.Members)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne<TeamMember>()
                    .WithOne(e => e.RefreshToken)
                    .HasForeignKey<RefreshToken>(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<Messages>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Sender)
                    .WithMany(e => e.SentMessages)
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Recipient)
                    .WithMany(e => e.ReceivedMessages)
                    .HasForeignKey(e => e.RecipientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            builder.Entity<Messages>().HasIndex(m => new { m.SenderId, m.RecipientId });
            builder.Entity<Messages>().HasIndex(m => m.SentAt);
            builder.Entity<Messages>().HasIndex(m => new { m.SentAt, m.Id });

            builder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(d => d.DepartmentName)
                .IsUnique();
            });

            builder.Entity<DepartmentMessage>(entity =>
            {
                entity.HasOne(e => e.Department)
                .WithMany(d => d.Messages)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<DepartmentMessage>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.DepartmentMessagesSent)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Event>()
                .HasOne(e => e.Organizer)
                .WithMany()
                .HasForeignKey(k => k.OrganizerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<EventAttendee>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.Entity<EventAttendee>()
                .HasOne(ea => ea.Event)
                .WithMany(e => e.Attendees)
                .HasForeignKey(ea => ea.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Event>()
                .HasIndex(e => new { e.Start, e.End });

            builder.Entity<EventAttendee>()
                .HasIndex(a => new { a.EventId, a.UserId })
                .IsUnique();

            builder.Entity<EventAttendee>()
                .HasIndex(a => a.UserId);

            builder.Entity<Event>()
                .Property(e => e.Title)
                .HasMaxLength(200)
                .IsRequired();

            builder.Entity<Event>()
                .Property(e => e.Location)
                .HasMaxLength(200);

            builder.Entity<TaskItem>()
                .HasOne(t => t.AssignedBy)
                .WithMany()
                .HasForeignKey(t => t.AssignedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<TaskItem>()
                .HasOne(t => t.AssignedBy)
                .WithMany()
                .HasForeignKey(t => t.AssignedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<MessageAttachment>()
                .HasOne(at => at.Message)
                .WithMany(m => m.Attachments)
                .HasForeignKey(at => at.MessageId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Meeting>()
                .HasOne(m => m.Event)
                .WithOne(e => e.Meeting)
                .HasForeignKey<Meeting>(m => m.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MeetingAttendee>()
                .HasOne(a => a.Meeting)
                .WithMany(m => m.Attendees)
                .HasForeignKey(a => a.MeetingId);

            builder.Entity<MeetingAttendee>()
            .HasOne(a => a.User)
            .WithMany(u => u.MeetingAttendees)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Meeting>()
                .HasOne(m => m.Host)
                .WithMany(u => u.HostedMeetings)
                .HasForeignKey(m => m.HostId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<UserProfile>()
                .HasOne(p => p.TeamMember)
                .WithOne(m => m.UserProfile)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
