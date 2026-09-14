import axios from "axios";
import type { ChangePasswordDto, LoginResponse } from "../types/types";
import  api  from "./axios";
import toast from "react-hot-toast";

export const login = async (email: string, password: string) => {
    try{
        const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
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
}

type Roles = {
    id: string,
    name: string
}

export const fetchRoles = async() => {   
    try{
        const {data} = await api.get<Roles[]>(`/auth/roles`);
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
}

export const refreshTokens = async() => {
    try{
        const {data} = await api.post<string>(`/auth/refresh`);
        return data;
    }
    catch(error: unknown){
        if(axios.isAxiosError(error)){
            throw new Error(error.response?.data);
        }
        else{
            toast.error("Unable to refresh")
            throw error;
        }
    }
}

export const forgotPassword = async(email: string) => {
    try{
        const response = await api.post<string>(`/auth/forgotPassword?email=${email}`);
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

export const changePassword = async(payload: ChangePasswordDto) => {
    try{
        const response = await api.post(`/auth/resetPassword`, payload);
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
