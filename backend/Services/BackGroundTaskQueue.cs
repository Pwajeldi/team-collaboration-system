using System.Threading.Channels;

namespace backend.Services
{
    public interface IBackgroundTaskQueue
    {
        ValueTask QueueAsync(Func<IServiceProvider, CancellationToken, Task> workItem);
        ValueTask<Func<IServiceProvider, CancellationToken, Task>> DequeueAsync(CancellationToken cancellationToken);
    }
    public class BackgroundTaskQueue : IBackgroundTaskQueue
    {
        private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> _queue =
            Channel.CreateUnbounded<Func<IServiceProvider, CancellationToken, Task>>();

        public async ValueTask QueueAsync(Func<IServiceProvider, CancellationToken, Task> workItem) =>
            await _queue.Writer.WriteAsync(workItem);

        public async ValueTask<Func<IServiceProvider, CancellationToken, Task>> DequeueAsync(CancellationToken ct) =>
            await _queue.Reader.ReadAsync(ct);
    }
}
