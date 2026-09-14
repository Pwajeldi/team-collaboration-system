import axios from 'axios'
import type { GetMessageDto, PaginatedMessageResponse, UploadAttachmentResponse } from '../types/types'
import api from './axios'


export const loadMessages = async(payload:GetMessageDto) => {
    try{
        const response = await api.get<PaginatedMessageResponse>("/team/messages", {
            params:{
                otherUserId: payload.otherUserId,
                encodedCursor: payload.encodedCursor,
            }
        })
        return response.data
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

export const uploadAttachment = async(file: File) => {
    try{
        const formData = new FormData();
        formData.append("file", file)
        const response = await api.post<UploadAttachmentResponse>("/files/attachments/upload", formData);
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

export const uploadDepartmentAttachment = async(file: File) => {
    try{
        const formData = new FormData();
        formData.append("file", file)
        const response = await api.post<UploadAttachmentResponse>("/files/groupattachments/upload", formData);
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

export const downloadAttachment = async(blobName: string) => {
    try{
        const response = await api.get<Blob>(`/files/attachments/download/${blobName}`, {
            responseType: "blob"
        });
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

export const deleteAttachment = async(id: number) => {
    try{
        const response = await api.delete(`/files/attachments/${id}`);
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