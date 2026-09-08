import toast from "react-hot-toast";
import { MessageCircle } from "lucide-react";
import { getInitials } from "../../services/getInitials";
import "../../styles/notificationToast.css";

type MessageToastProps = {
    toastId: string;
    senderName: string;
    content: string;
    onView: () => void;
};

const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max).trimEnd() + "…" : text;

const MessageToast = ({ toastId, senderName, content, onView }: MessageToastProps) => {
    return(
        <div className="app-toast">
        <div className="app-toast-icon message">
            <MessageCircle size={16} />
        </div>
        <div className="app-toast-body">
            <div className="app-toast-header">
                <span className="app-toast-avatar">{getInitials(senderName)}</span>
                <span className="app-toast-title">{senderName}</span>
            </div>
            <p className="app-toast-preview">{truncate(content, 80)}</p>
            <div className="app-toast-actions">
                <button className="app-toast-action" onClick={() => { onView(); toast.dismiss(toastId); }}>
                    View Message
                </button>
                <button className="app-toast-dismiss" onClick={() => toast.dismiss(toastId)}>Dismiss</button>
            </div>
        </div>
    </div>
    )
}
    
export default MessageToast;