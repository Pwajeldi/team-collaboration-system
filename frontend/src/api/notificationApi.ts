import api from "./axios";
import type { NotificationResponseDto } from "../types/types";
import axios from "axios";

export const fetchMyNotifications = async () => {
    try{
        const { data } = await api.get<NotificationResponseDto[]>("/notification");
        return data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data);
        }
        else{
            console.log(error as string)
            throw error;
        }
    }    
};

export const sendNotification = async (formData: FormData) => {
    try{
        const { data } = await api.post<NotificationResponseDto>("/notification/send", formData);
        return data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data);
        }
        else{
            console.log(error as string)
            throw error;
        }
    }  
};

export const markNotificationRead = async (id: string) => {
    try{
        await api.patch(`/notification/${id}/read`);
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data);
        }
        else{
            console.log(error as string)
            throw error;
        }
    }    
};