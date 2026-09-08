using backend.Exceptions;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    [Authorize]
    public class MeetingHub : Hub
    {
        private readonly IMeetingHubService _meetingService;

        public MeetingHub(IMeetingHubService meetingService)
        {
            _meetingService = meetingService;
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrWhiteSpace(userId))
            {
                await _meetingService.OnConnected(userId, Context.ConnectionId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinMeeting(Guid meetingId)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrWhiteSpace(userId)) { Context.Abort(); return; }
            try
            {
                var otherParticipants = await _meetingService.AddToMeeting(meetingId, userId, Context.ConnectionId);
                await Clients.Caller.SendAsync("ExistingParticipants", otherParticipants);
            }
            catch (MeetingFullException ex)
            {
                await Clients.Caller.SendAsync("MeetingJoinRejected", ex.Message);
            }
            catch(MemberNotInvitedException ex)
            {
                await Clients.Caller.SendAsync("MeetingJoinRejected", ex.Message);
            }
        }

        public async Task LeaveMeeting(Guid meetingId)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrWhiteSpace(userId)) return;
            await _meetingService.LeaveMeeting(meetingId, userId, Context.ConnectionId);
        }

        public async Task SendOffer(string targetUserId, string offerSdp)
        {
            await Clients.User(targetUserId).SendAsync("ReceiveOffer", Context.UserIdentifier, offerSdp);
        }

        public async Task SendAnswer(string targetUserId, string answerSdp)
        {
            await Clients.User(targetUserId).SendAsync("ReceiveAnswer", Context.UserIdentifier, answerSdp);
        }
            

        public async Task SendIceCandidate(string targetUserId, string candidate)
        {
           await Clients.User(targetUserId).SendAsync("ReceiveIceCandidate", Context.UserIdentifier, candidate);
        }
            
    }
}
