import  api  from "./axios";
import type { CreateEventDto, EventResponse, UpdateEventDto, UpdateEventTimeDto } from "../types/types";
import axios from "axios";

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
    const {data} = await api.put<EventResponse>(`/calendar/event/update`, event);
    return data;
}

export const updateEventDuration = async(eventDto: UpdateEventTimeDto) => {
    try{
        const response = await api.put<string>(`/calendar/update-duration`, eventDto);
        return response.data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data);
        }
        else{
            console.log(error as string)
        }
    }  
}