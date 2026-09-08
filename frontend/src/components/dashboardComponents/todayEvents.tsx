import type { DashboardEventResponse } from "../../types/types";
import "../../styles/dashboard.css";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

type TodayEventsProps = {
    data: DashboardEventResponse[];
};

const formatTimeRange = (start: string, end: string) => {
    const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
};

const TodayEvents = ({ data }: TodayEventsProps) => {
    return (
        <div className="dashboard-card">
            <div className="dashboard-card-header">
                <p className="dashboard-card-title">Today's Events</p>
                <Link to={"/calendar"} className="view-all">View All <ArrowRight size={12}/></Link>
            </div>
            {data.length === 0 ? (
                <p className="dashboard-card-empty">No events scheduled for today.</p>
            ) : (
                <div className="dashboard-list">
                    {data.map((event, i) => (
                        <div className="dashboard-list-row" key={i}>
                            <div className="dashboard-list-content">
                                <div className="dashboard-list-top">
                                    <span className="dashboard-list-name">{event.title}</span>
                                    <span className="dashboard-list-time">{formatTimeRange(event.start, event.end)}</span>
                                </div>
                                {event.location && (
                                    <p className="dashboard-list-preview">{event.location}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TodayEvents;