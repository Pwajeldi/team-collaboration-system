namespace backend.Exceptions
{
    public class MemberNotInvitedException : Exception
    {
        public MemberNotInvitedException()
        {
        }
        public MemberNotInvitedException(string? message) : base(message)
        {
        }
        public MemberNotInvitedException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }

    public class MeetingFullException : Exception
    {
        public MeetingFullException()
        {
        }
        public MeetingFullException(string? message) : base(message)
        {
        }
        public MeetingFullException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }
}
