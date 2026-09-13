using System.Collections.Concurrent;

namespace backend.Services
{
    public interface IConnectionManager
    {
        void AddConnection(string userId, string connectionId);
        bool RemoveConnection(string userId, string connectionId);
        IEnumerable<string> GetConnections(string userId);
        IEnumerable<string> GetOnlineUserIds();
        bool IsAnyDepartmentMemberOnline(List<string> userIds);
    }
    public class ConnectionManager : IConnectionManager
    {
        private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();
        public void AddConnection(string userId, string connectionId)
        {
            var connections = _userConnections.GetOrAdd(userId, _ => []);
            lock (connections)
            {
                connections.Add(connectionId);
            }
        }

        public bool RemoveConnection(string userId, string connectionId)
        {
            if(_userConnections.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    connections.Remove(connectionId);
                    if (connections.Count == 0)
                    {
                        _userConnections.TryRemove(userId, out _);
                        return true; // meaning no more connections, the user is now offline
                    }
                }
            }
            return false; //user still has some connections
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

        public bool IsAnyDepartmentMemberOnline(List<string> userIds)
        {
            return userIds.Any(id => _userConnections.ContainsKey(id));

        }

        public IEnumerable<string> GetOnlineUserIds()
        {
            return _userConnections.Keys.ToList();
        }
    }
}
