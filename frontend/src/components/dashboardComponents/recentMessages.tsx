import type { RecentMessageDto } from "../../types/types";
import "../../styles/dashboard.css";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

type RecentMessagesProps = {
    data: RecentMessageDto[];
};

const formatRelativeTime = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

const RecentMessages = ({ data }: RecentMessagesProps) => {
    return (
        <div className="dashboard-card">
            <div className="dashboard-card-header">
                <p className="dashboard-card-title">Recent Messages</p>
                <Link to={"/chat"} className="view-all">Go to Messages <ArrowRight size={12}/></Link>
            </div>
            
            {data.length === 0 ? (
                <p className="dashboard-card-empty">No recent messages.</p>
            ) : (
                <div className="dashboard-list">
                    {data.map((msg, i) => (
                        <div className="dashboard-list-row" key={i}>
                            <div className="dashboard-avatar">
                                {msg.senderName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <div className="dashboard-list-content">
                                <div className="dashboard-list-top">
                                    <span className="dashboard-list-name">{msg.senderName}</span>
                                    <span className="dashboard-list-time">{formatRelativeTime(msg.sentAt)}</span>
                                </div>
                                <p className="dashboard-list-preview">{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentMessages;