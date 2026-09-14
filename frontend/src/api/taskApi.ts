import axios from "axios";
import type { AssignableMembers, CreateTaskDto, TaskQueryParams, TaskResponse, TaskStatusType, TaskSummaryResponse, UpdateTaskDto } from "../types/types";
import api from "./axios";


export const fetchTasks = async (queryParams: TaskQueryParams) => {
    try{
        const { data } = await api.get<TaskResponse[]>("/task/tasks", {
            params: queryParams
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

export const fetchTask = async (id: string) => {
    try{
        const { data } = await api.get<TaskResponse>(`/task/tasks/${id}`);
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

export const createTask = async (payload: CreateTaskDto) => {
    try{
        const { data } = await api.post<TaskResponse>("/task/create", payload);
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

export const updateTaskStatus = async ({ id, status }: { id: string; status: TaskStatusType })=> {
    try{
        const { data } = await api.patch<TaskResponse>(`/task/status/${id}`, {status});
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

export const updateTask = async ({ id, payload }: { id: string; payload: UpdateTaskDto }) => {
    try{
        const { data } = await api.put<TaskResponse>(`/task/update/${id}`, payload);
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

export const deleteTask = async (id: string) => {
    try{
        await api.delete<void>(`/task/delete/${id}`);
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

export const fetchAssignableMembers = async () => {
    try{
        const { data } = await api.get<AssignableMembers[]>("/task/team/assignable");
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

export const fetchTaskSummary = async () => {
    try{
        const {data} = await api.get<TaskSummaryResponse>("/task/summary");
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