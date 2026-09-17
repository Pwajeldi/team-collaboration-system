import axios from "axios";
import type { PasswordResetDto, UpdateProfileDto, UserProfileResponse } from "../types/types";
import api from "./axios";

export const getMyProfile = async () => {
    try{
        const response = await api.get<UserProfileResponse>(`/profile/myprofile`);
        return response.data;
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
}

export const deleteProfile = async () => {
    try{
        const response = await api.delete(`/profile/delete`);
        return response.data;
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
}

export const updateMyProfile = async(payload: UpdateProfileDto) => {
    try{
        const response = await api.put(`/profile/update/`, payload);
    return response.data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data)
        }else{
            throw new Error(error as string)
        }
    }   
}

export const resetPassword = async(payload: PasswordResetDto) => {
    try{
        const response = await api.put(`/profile/password/update`, payload);
        return response.data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data)
        }else{
            throw new Error(error as string)
        }
    }
}

export const uploadProfilePicture = async(image: File) => {
    try{
        const formData = new FormData();
        formData.append("picture", image);
        const response = await api.post<string>(`/files/profile/picture/upload`, formData);
        return response.data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data)
        }else{
            throw new Error(error as string)
        }
    }
}