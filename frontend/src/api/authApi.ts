import axios from "axios";
import type { ChangePasswordDto, LoginResponse } from "../types/types";
import  api  from "./axios";

export const login = async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
}

type Roles = {
    id: string,
    name: string
}

export const fetchRoles = async() => {
    const {data} = await api.get<Roles[]>(`/auth/roles`);
    return data;
}

export const refreshTokens = async() => {
    const {data} = await api.post<string>(`/auth/refresh`);
    return data;
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
        }
    }
}
