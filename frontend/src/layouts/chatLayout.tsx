import UserList from "../components/userList";
import ChatPage from "../pages/chatPage";
import "../styles/chatLayout.css";
import { useChat } from "../contexts/chatContext";

const ChatLayout = () => {
   
    const {selectedUser} = useChat();

    return (
        <div className="chat-layout">
            <UserList/>
            {selectedUser ? (
                <ChatPage />
            ) : (
                <div className="chat-placeholder">Select a conversation to start chatting</div>
            )}
        </div>
    );
};

export default ChatLayout;