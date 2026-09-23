// pages/notificationsPage.tsx
import { useState } from "react";
import { Bell } from "lucide-react";
import { useGetNotifications, useMarkNotificationRead } from "../hooks/notificationHook";
import NotificationComposeForm from "../components/notificationComposeForm";
import Loader from "../components/loader";
import type { NotificationResponseDto } from "../types/types";
import "../styles/notificationsPage.css";
import NotificationModal from "../components/modals/notificationModal";

const typeIconClass: Record<string, string> = {
    info: "notif-icon-info",
    warning: "notif-icon-warning",
    announcement: "notif-icon-announcement",
    important: "notif-icon-important",
};

const NotificationsPage = () => {
    const roles: string[] = JSON.parse(sessionStorage.getItem("roles") ?? "[]");
    const canBroadcast = roles.includes("hr");
    const query = useGetNotifications();
    const markRead = useMarkNotificationRead();
    const [tab, setTab] = useState<"send" | "view">(canBroadcast ? "send" : "view");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [openNotifModal, setOpenNotifModal] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<NotificationResponseDto>();

    const handleExpand = (n: NotificationResponseDto) => {
        setExpandedId((prev) => (prev === n.id ? null : n.id));
        if (!n.isRead) markRead.mutate(n.id);
    };

    if (query.isLoading) return <Loader />;

    return (
        <div className="notifications-page">
            <p className="notifications-title"><Bell size={20} /> Notifications</p>

            {canBroadcast && (
                <div className="notif-tabs">
                    <button className={tab === "send" ? "active" : ""} onClick={() => setTab("send")}>Send New</button>
                    <button className={tab === "view" ? "active" : ""} onClick={() => setTab("view")}>All Notifications</button>
                </div>
            )}

            {tab === "send" && canBroadcast ? (
                <NotificationComposeForm />
            ) : (
                <div className="notifications-list">
                    {query.data?.length === 0 && <p className="notifications-empty">No notifications yet.</p>}
                    {query.data?.map((n) => (
                        <div key={n.id} className={`notification-card ${!n.isRead ? "unread" : ""}`} onClick={() => {
                            handleExpand(n);
                            setSelectedNotif(n);
                            setOpenNotifModal(true)
                            }
                            }>
                            <div className={`notification-icon ${typeIconClass[n.type]}`}>
                                <Bell size={16} />
                            </div>
                            <div className="notification-body">
                                <div className="notification-header">
                                    <span className="notification-title">{n.title}</span>
                                    <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
                                </div>
                                <p className={expandedId === n.id ? "" : "notification-preview"}>{n.message}</p>
                                <span className="notification-sender">from {n.createdByName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
                <NotificationModal 
                showNotif={openNotifModal} 
                onClose={()=>setOpenNotifModal(false)} 
                notification={selectedNotif}/>
        </div>
    );
};

export default NotificationsPage;