import { useState } from "react"
import ActionButton from "./actionsButton"
import { Eye, MessageCircleMore } from "lucide-react";
import { useNavigate } from "react-router";
import "../styles/userActionsMenu.css"
import { useChat, type selectedUser } from "../contexts/chatContext";

const UserActionsMenu = ({user}:{user:selectedUser}) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const {setSelectedUser} = useChat();
    const SwitchOpenState = () => {setOpen(prev => !prev)};
    const GoToChat = (user: selectedUser|null) => {
        setSelectedUser(user);
        navigate("/chat");
    };

    return(
        <div className="user-actions-menu">
            <ActionButton onClick={SwitchOpenState}/>
            {open && (
                <div className="user-actions-dropdown">
                    <button className="user-actions-dropdown-item" onClick={() => GoToChat(user)}>
                        <MessageCircleMore size={14}/> Chat
                    </button>

                    <button className="user-actions-dropdown-item">
                        <Eye size={14}/> View Profile
                    </button>
                </div>
            )}
        </div>
    )
}

export default UserActionsMenu