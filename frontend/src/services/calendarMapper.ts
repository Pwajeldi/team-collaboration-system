
import { type EventInput } from "@fullcalendar/core";
import { type EventResponse } from "../types/types";

export const mapToFullCalendarEvents = (events: EventResponse[]): EventInput[] => {
    return events.map((event) => ({
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
};