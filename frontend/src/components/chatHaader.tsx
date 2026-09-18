import { useChat } from "../contexts/chatContext"
import { getInitials } from "../services/getInitials";
import "../styles/chatHeader.css";

const ChatHeader = () => {
    const {selectedUser} = useChat();
    if(!selectedUser) return null;

    const initials = getInitials(selectedUser?.fullName ?? "User");

    return(
        <div className="chat-header">
            <div className="chat-header-avatar">
                {
                    selectedUser.profilePictureUrl 
                    ? <img src={selectedUser.profilePictureUrl}/>
                    :  initials
                }             
            </div>

            <div className="chat-header-info">
                <h2>{selectedUser?.fullName}</h2>
            </div>
        </div>
    )
}

export default ChatHeader;