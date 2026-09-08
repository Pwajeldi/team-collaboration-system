// utils/mapToFullCalendarEvents.ts
import { type EventInput } from "@fullcalendar/core";
import { type CalendarEvents } from "../types/types";

export const mapToFullCalendarEvents = (events: CalendarEvents[]): EventInput[] => {
    return events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        extendedProps: {
            description: event.description,
            location: event.location,
            attendees: event.attendees,
            organizer: event.organizer,
        },
    }));
};