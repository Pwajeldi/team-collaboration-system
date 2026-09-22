import toast from "react-hot-toast";
import { Bell } from "lucide-react";
import "../../styles/notificationToast.css";

type NotificationToastProps = {
    toastId: string;
    title: string;
    type: string;
    onView: () => void;
};

const NotificationToast = ({ toastId, title, type, onView }: NotificationToastProps) => (
    <div className="app-toast">
        <div className={`app-toast-icon notif-${type}`}>
            <Bell size={16} />
        </div>
        <div className="app-toast-body">
            <span className="app-toast-title">{title}</span>
            <div className="app-toast-actions">
                <button className="app-toast-action" onClick={() => { onView(); toast.dismiss(toastId); }}>View</button>
                <button className="app-toast-dismiss" onClick={() => toast.dismiss(toastId)}>Dismiss</button>
            </div>
        </div>
    </div>
);

export default NotificationToast;