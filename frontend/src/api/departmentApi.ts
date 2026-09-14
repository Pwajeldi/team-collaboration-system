import axios from "axios";
import type { DepartmentResponse, PaginatedDepartmentMessageResponse } from "../types/types";
import api from "./axios";

export const fetchDepartments = async() => {
    try{
        const {data} = await api.get<DepartmentResponse[]>(`/department/get`);
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

export const loadDepartmentMessages = async (encodedCursor?: string) => {
    try{
        const { data } = await api.get<PaginatedDepartmentMessageResponse>("/department/messages", {
            params: encodedCursor ? { encodedCursor } : {},
        });
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

export const createDepartment = async(payload: string) => {
    try{
        const {data} = await api.post(`/department/create`, JSON.stringify(payload),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
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

export const deleteDepartment = async(depId: number) => {
    try{
        const {data} = await api.delete(`/department/delete`, {
            params:{
                departmentId: depId
            }
        });
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