import axios from "axios";
import type { PasswordResetDto, UpdateProfileDto, UserProfileResponse } from "../types/types";
import api from "./axios";

export const getMyProfile = async () => {
    const response = await api.get<UserProfileResponse>(`/profile/myprofile`);
    return response.data;
}

export const deleteProfile = async () => {
    const response = await api.delete(`/profile/delete`);
    return response.data;
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