import  api  from "./axios";
import type { CreateEventDto, EventResponse, UpdateEventDto } from "../types/types";

export const fetchEvents = async() => {
    const response = await api.get<EventResponse[]>("calendar/events");
    return response.data
}


export const createEvent = async (payload: CreateEventDto)=> {
    const { data } = await api.post<EventResponse>("/calendar/events/create", payload);
    return data;
};

export const deleteEvent = async(id: string) => {
    const {data} = await api.delete(`/calendar/events/delete`, {
        params:{
            eventId: id
        }
    });
    return data;
}

export const updateEvent = async(event: UpdateEventDto) => {
    const {data} = await api.put(`/calendar/event/update`, event);
    return data;
}