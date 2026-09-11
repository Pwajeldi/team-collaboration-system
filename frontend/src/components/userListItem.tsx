import { useIsUserOnline } from "../hooks/memberHook";
import type { UserList } from "../types/types";
import "../styles/userList.css";
import { useChat } from "../contexts/chatContext";
import { getInitials } from "../services/getInitials";

type UserListItemProps = {
    user: UserList,
}
const UserListItem = ({user}: UserListItemProps) => {
    const {selectedUser, setSelectedUser} = useChat();
    const isOnline = useIsUserOnline(user.userId);
    return(
    <button
        key={user.userId}
        className={`user-list-item ${selectedUser?.userId === user.userId ? "active" : ""}`}
        onClick={() => setSelectedUser({userId:user.userId, fullName: user.fullName})}
    >
        <span className="avatar-wrapper">
            <span className="avatar">{getInitials(user.fullName)}</span>
            {isOnline && <span className="online-dot" />}
        </span>       
        <span className="user-name">{user.fullName}</span>
        {user.unreadMessages > 0 && <span className="unread-badge">{user.unreadMessages > 20 ? "20+" : user.unreadMessages}</span>}
    </button>
    )
}

export default UserListItem