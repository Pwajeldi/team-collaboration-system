using Amazon.S3.Model;
using backend.Data;
using backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class EventNotificationRetryJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EventNotificationRetryJob> _logger;
        private readonly IBackgroundTaskQueue _backgroundTaskQueue;
        public EventNotificationRetryJob(IServiceScopeFactory scopeFactory, ILogger<EventNotificationRetryJob> logger, IBackgroundTaskQueue backgroundTaskQueue)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _backgroundTaskQueue = backgroundTaskQueue;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<TeamDbContext>();

                    var stuck = await db.Events.Where(e => !e.NotificationsSent && e.CreatedAt < DateTime.UtcNow.AddMinutes(-5)).ToListAsync();

                    foreach (var ev in stuck)
                    {
                        _logger.LogInformation("Resending Event notification email: Event - {Event}", ev.Id);
                        await _backgroundTaskQueue.QueueAsync(async (services, ct) =>
                        {
                            var db = services.GetRequiredService<TeamDbContext>();
                            var emailService = services.GetRequiredService<IEmailService>();

                            var savedEvent = await db.Events.Include(e => e.Attendees).
                                    ThenInclude(e => e.User).
                                    FirstAsync(e => e.Id == ev.Id, ct);

                            foreach (var attendee in savedEvent.Attendees)
                            {
                                try
                                {
                                    await emailService.SendEventInvite(attendee.User, savedEvent, attendee.HadOverlapAtCreation, ct);
                                }
                                catch (Exception ex)
                                {
                                    _logger.LogError(ex, "Failed to email invite to {UserId} for event {EventId}", attendee.UserId, savedEvent.Id);
                                }
                            }

                            savedEvent.NotificationsSent = true;
                            await db.SaveChangesAsync(ct);
                        });
                    }
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while resending emails to attendees: {Error}", ex.InnerException?.Message);
                }
                
            }
        }
    }
}
