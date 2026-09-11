import { X, MapPin, Clock, User, Users, Trash2, Video, Pencil } from "lucide-react";
import type { EventResponse } from "../types/types";
import { useDeleteEvent } from "../hooks/calendarHook";
import "../styles/eventDetailModal.css";
import { getUserId } from "../services/jwtdecode";
import { useState } from "react";
import UpdateEventModal from "./eventUpdateModal";

type EventDetailModalProps = {
    event: EventResponse;
    onClose: () => void;
    onDeleted: () => void;
    onJoinMeeting: (event: EventResponse) => void;
};

const formatRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const sameDay = s.toDateString() === e.toDateString();
    const dateStr = s.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const timeOpts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    return sameDay
        ? `${dateStr} · ${s.toLocaleTimeString([], timeOpts)} – ${e.toLocaleTimeString([], timeOpts)}`
        : `${s.toLocaleString([], { month: "short", day: "numeric", ...timeOpts })} – ${e.toLocaleString([], { month: "short", day: "numeric", ...timeOpts })}`;
};

const EventDetailModal = ({ event, onClose, onDeleted, onJoinMeeting}: EventDetailModalProps) => {
    const deleteEvent = useDeleteEvent();
    const currentUserId = getUserId();
    const isOrganizer = event.organizerId === currentUserId;
    const [viewUpdateEventModal, setViewUpdateEventModal] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Delete "${event.title}"? This can't be undone.`)) return;
        await deleteEvent.mutateAsync(event.id);
        onDeleted();
    };

    if (viewUpdateEventModal) {
        return (
            <UpdateEventModal
                event={event}
                onClose={() => {
                    setViewUpdateEventModal(false);
                    onClose();
                }}
            />
        );
    }


    return (
        <div className="event-detail-overlay" onClick={onClose}>
            <div className="event-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="event-detail-header">
                    <h3>{event.title}</h3>
                    <button className="event-detail-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="event-detail-body">
                    <div className="event-detail-row">
                        <Clock size={16} />
                        <span>{formatRange(event.start, event.end)}</span>
                    </div>

                    {event.location && (
                        <div className="event-detail-row">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                        </div>
                    )}

                    <div className="event-detail-row">
                        <User size={16} />
                        <span>Organized by {event.organizerName}</span>
                    </div>

                    {event.description && (
                        <p className="event-detail-description">{event.description}</p>
                    )}

                    {event.attendees.length > 0 && (
                        <div className="event-detail-attendees">
                            <div className="event-detail-row">
                                <Users size={16} />
                                <span>People: {event.attendees.map(a => a.fullName+", ")}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="event-detail-actions">
                    {event.isMeeting && event.meetingId && (
                    <button className="event-detail-join-btn" onClick={() => onJoinMeeting(event)}>
                        <Video size={14} />
                    </button>
                    )}
                    {isOrganizer && (<button
                        className="event-detail-edit-btn"
                        onClick={()=>{setViewUpdateEventModal(true);}}
                    >
                        <Pencil size={14} />
                        {"Edit"}
                    </button>
                    )}
                    {isOrganizer && (<button
                        className="event-detail-delete-btn"
                        onClick={handleDelete}
                        disabled={deleteEvent.isPending}
                    >
                        <Trash2 size={14} />
                        {deleteEvent.isPending ? "Cancelling…" : "Cancel Event"}
                    </button>
                    )}
                </div>       
            </div>
        </div>
    );
};

export default EventDetailModal;