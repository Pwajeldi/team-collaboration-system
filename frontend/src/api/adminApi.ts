import axios from "axios";
import type { UpdateMemberDto } from "../types/types";
import api from "./axios";

export const updateMember = async ({ id, payload }: { id: string; payload: UpdateMemberDto }) => {
    try{
        const { data } = await api.put(`/team/update/${id}`, payload);
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

export const deleteMember = async (id: string) => {
    try{
        await api.delete(`/team/delete/${id}`);
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

export const assignRole = async ({ userId, role }: { userId: string; role: string }) => {
    try{
        const { data } = await api.post(`/auth/users/${userId}/assign-role/${role}`);
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

export const removeRole = async ({ userId, role }: { userId: string; role: string }) => {
    try{
        const { data } = await api.delete(`/auth/users/${userId}/roles/${role}`);
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