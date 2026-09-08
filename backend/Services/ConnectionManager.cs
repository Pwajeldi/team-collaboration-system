using System.Collections.Concurrent;

namespace backend.Services
{
    public interface IConnectionManager
    {
        void AddConnection(string userId, string connectionId);
        void RemoveConnection(string userId, string connectionId);
        IEnumerable<string> GetConnections(string userId);
    }
    public class ConnectionManager : IConnectionManager
    {
        private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();
        public void AddConnection(string userId, string connectionId)
        {
            var connections = _userConnections.GetOrAdd(userId, _ => new HashSet<string>());
            lock (connections)
            {
                connections.Add(connectionId);
            }
        }

        public void RemoveConnection(string userId, string connectionId)
        {
            if(_userConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    connections.Remove(connectionId);
                    if (connections.Count == 0)
                    {
                        _userConnections.TryRemove(userId, out _);
                    }
                }
            }
        }

        public IEnumerable<string> GetConnections(string userId)
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    return connections.ToList();
                }
            }
            return Enumerable.Empty<string>();
        }
    }
}
