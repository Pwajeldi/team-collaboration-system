import { useState } from "react"
import ActionButton from "./actionsButton"
import { Eye, MessageCircleMore } from "lucide-react";
import { useNavigate } from "react-router";
import "../styles/userActionsMenu.css"
import { useChat, type selectedUser } from "../contexts/chatContext";
import UserProfileModal from "./modals/userProfileModal";

const UserActionsMenu = ({user}:{user:selectedUser}) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const {setSelectedUser} = useChat();
    const SwitchOpenState = () => {setOpen(prev => !prev)};
    const GoToChat = (user: selectedUser|null) => {
        setSelectedUser(user);
        navigate("/chat");
    };
    const [showProfile, setShowProfile] = useState(false);

    return(
    <>
        <div className="user-actions-menu">
            <ActionButton onClick={SwitchOpenState}/>
            {open && (
                <div className="user-actions-dropdown">
                    <button className="user-actions-dropdown-item" onClick={() => GoToChat(user)}>
                        <MessageCircleMore size={14}/> Chat
                    </button>

                    <button className="user-actions-dropdown-item" onClick={()=>{
                        setShowProfile(true);
                        setOpen(false)
                    }}>
                        <Eye size={14}/> View Profile
                    </button>
                </div>
            )}
        </div>
        <UserProfileModal 
        userId={user.userId}
        onClose={()=>setShowProfile(false)}
        showProfile={showProfile}/>   
    </>
    )
}

export default UserActionsMenu