import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
    EventClickArg, EventDropArg, EventChangeArg,
    DateSelectArg, EventContentArg,
} from "@fullcalendar/core";
import { useGetEvents } from "../hooks/calendarHook";
import EventFormModal from "../components/eventFormModal";
import "../styles/calendar.css";
import type { EventResponse, UpdateEventTimeDto } from "../types/types";
import EventDetailModal from "../components/eventDetailModal";
import Loader from "../components/loader";
import MeetingRoom from "../components/meetingRoom";
import UpdateEventDurationModal from "../components/eventDurationModal";
import { getUserId } from "../services/jwtdecode";

const Calendar = () => {
    const calendarRef = useRef<FullCalendar>(null);
    const currentUserId = getUserId();
    const query = useGetEvents();
    const [use24HrFormat, setUse24HrFormat] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [showUpdateTimeModal, setShowUpdateTimeMoal] = useState(false);
    const [modalRange, setModalRange] = useState<{ start?: string; end?: string }>({});
    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>();
    const [updateEventDuration, setUpdateEventDuration] = useState<UpdateEventTimeDto>();
    const dateOption: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }
    const [activeMeeting, setActiveMeeting] = useState<{ meetingId: string; participantNames: Record<string, string> } | null>(null);

    const handleJoinMeeting = (event: EventResponse) => {
        const names: Record<string, string> = {};
        event.attendees.forEach(a => { names[a.userId] = a.fullName; });
        names[event.organizerId] = event.organizerName;

        setActiveMeeting({ meetingId: event.meetingId!, participantNames: names });
        setSelectedEvent(null);
    };

    const calendarEvents = useMemo(() => {
        return (query.data ?? []).map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            extendedProps: {
                description: event.description,
                location: event.location,
                organizerName: event.organizerName,
                organizerId: event.organizerId,
                attendees: event.attendees,
                isMeeting: event.isMeeting,
                meetingId: event.meetingId ?? null,
                meetingStatus: event.meetingStatus ?? null,
            },
        }));
    }, [query.data]);

    const timeFormat = useMemo(() => ({
        hour: "numeric" as const,
        minute: "2-digit" as const,
        hour12: !use24HrFormat,
        meridiem: use24HrFormat ? (false as const) : ("lowercase" as const),
    }), [use24HrFormat]);

    const handleEventClick = (clickInfo: EventClickArg) => {
    const fullEvent = query.data?.find((e) => e.id === clickInfo.event.id);
    if (fullEvent) setSelectedEvent(fullEvent);
    };

    const handleEventChange = async (changeInfo: EventDropArg | EventChangeArg) => {
        const organizerId:string = changeInfo.event.extendedProps.organizerId;
        const isOrganizer = currentUserId === organizerId;
        if(!isOrganizer){return;}
        
        const newStartStr = changeInfo.event.startStr;
        const newEndStr = changeInfo.event.endStr;
        console.log(newStartStr, newEndStr);
        const eventId = changeInfo.event.id;
        const newStart = new Date(newStartStr).toLocaleDateString("en-US", dateOption);
        const newEnd = new Date(newEndStr).toLocaleDateString("en-US", dateOption);
        console.log(newStart, newEnd);
        setUpdateEventDuration({
            eventId: eventId,
            newStartTime: newStartStr,
            newEndTime: newEndStr,
        });
        setShowUpdateTimeMoal(true);
    };

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setModalRange({ start: selectInfo.startStr, end: selectInfo.endStr });
        setModalOpen(true);
    };

    const openCreateModal = () => {
        setModalRange({});
        setModalOpen(true);
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        return (
            <div className="event-pill">
                {eventInfo.timeText && <span className="event-time">{eventInfo.timeText}</span>}
                <span className="event-title">{eventInfo.event.title}</span>
            </div>
        );
    };

    const handleResize = () => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        if (window.innerWidth < 768) {
            api.changeView("timeGridDay");
        } else {
            api.changeView("dayGridMonth");
        }
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => { window.removeEventListener("resize", handleResize); };
    }, []);

    if (query.isLoading) return(
       <Loader/>
    );

    if (query.isError) return <div className="calendar-error">Couldn't load events.</div>;

    return (
        <div className="calendar-container">
            <div className="calendar-toolbar-extra">
                <button className="time-format-btn" onClick={() => setUse24HrFormat(v => !v)}>
                    {use24HrFormat ? "24h" : "12h"}
                </button>
                <button className="calendar-create-btn" onClick={openCreateModal}>
                    + New Event
                </button>
            </div>
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                height="100%"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                editable={true}
                selectable={true}
                dayMaxEvents={3}
                eventTimeFormat={timeFormat}
                slotLabelFormat={timeFormat}
                select={handleDateSelect}
                eventClick={handleEventClick}
                //eventDrop={handleEventChange}
                eventResize={handleEventChange}
                eventContent={renderEventContent}
                events={calendarEvents}
            />
            {modalOpen && (
                <EventFormModal
                    initialStart={modalRange.start}
                    initialEnd={modalRange.end}
                    onClose={() => setModalOpen(false)}
                    onSuccess={() => setModalOpen(false)}
                />
            )}

            {selectedEvent && (
            <EventDetailModal
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onDeleted={() => setSelectedEvent(null)}
                onJoinMeeting={handleJoinMeeting}
            />
            )}

            {activeMeeting && (
                <MeetingRoom
                    meetingId={activeMeeting.meetingId}
                    participantNames={activeMeeting.participantNames}
                    onLeave={() => setActiveMeeting(null)}
                />
            )}

            {showUpdateTimeModal && (
                <UpdateEventDurationModal onClose={()=>setShowUpdateTimeMoal(false)} eventDto={updateEventDuration}/>
            )}
        </div>
    );
};

export default Calendar;