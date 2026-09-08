using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class EventNotificationRetryJob : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        public EventNotificationRetryJob(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<TeamDbContext>();

                var stuck = await db.Events.Where(e => !e.NotificationsSent && e.CreatedAt < DateTime.UtcNow.AddMinutes(-5)).ToListAsync();

                foreach (var e in stuck)
                {
                    // re-queue via IBackgroundTaskQueue, or process inline here
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
