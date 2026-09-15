import axios from 'axios';
import type { CreateMemberDto, getMemberResponse, MemberQueryParams, PagedMembersResponse, UpdateMemberDto, UserList } from '../types/types'
import api from './axios'

export const getMember = async(id:string) => {
    try{
        const {data} = await api.get<getMemberResponse>(`team/${id}`);
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

export const getMembers = async(page: number, pageSize: number, filters: MemberQueryParams) => {
    try{
        const {data} = await api.get<PagedMembersResponse>(`/team/members`, {
            params: {
                page: page,
                pageSize: pageSize,
                ...filters,
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

export const deleteMember = async(id:string) => {
    try{
        const {data} = await api.delete(`team/delete/${id}`);
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

export const createMember = async(payload: CreateMemberDto) => {
    try{
        const {data} =  await api.post<string>("/team/create", payload);
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

export const updateMember = async(id: string, payload: UpdateMemberDto) => {
    try{
        const {data} = await api.put(`/team/update/${id}`, payload);
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

export const getUsersToDM = async(filters?: MemberQueryParams) => {
    try{
        const {data} = await api.get<UserList[]>(`/team/listusers`, {
            params: {...filters}
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

export const fetchOnlineUsers = async () => {
    try{
        const { data } = await api.get<string[]>("/team/online");
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
