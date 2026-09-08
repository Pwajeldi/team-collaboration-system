import toast from "react-hot-toast";
import { CalendarClock } from "lucide-react";
import "../../styles/notificationToast.css";

type EventToastProps = {
    toastId: string;
    title: string;
    start: string;
    onView: () => void;
};

const EventToast = ({ toastId, title, start, onView }: EventToastProps) => {
    const formatted = new Date(start).toLocaleString([], {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });

    return (
        <div className="app-toast">
            <div className="app-toast-icon event">
                <CalendarClock size={16} />
            </div>
            <div className="app-toast-body">
                <span className="app-toast-title">New event: {title}</span>
                <p className="app-toast-preview">{formatted}</p>
                <div className="app-toast-actions">
                    <button className="app-toast-action" onClick={() => { onView(); toast.dismiss(toastId); }}>
                        View Event
                    </button>
                    <button className="app-toast-dismiss" onClick={() => toast.dismiss(toastId)}>Dismiss</button>
                </div>
            </div>
        </div>
    );
};

export default EventToast;