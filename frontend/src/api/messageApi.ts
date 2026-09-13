import type { GetMessageDto, PaginatedMessageResponse, UploadAttachmentResponse } from '../types/types'
import api from './axios'


export const loadMessages = async(payload:GetMessageDto) => {
    const response = await api.get<PaginatedMessageResponse>("/team/messages", {
        params:{
            otherUserId: payload.otherUserId,
            encodedCursor: payload.encodedCursor,
        }
    })
    return response.data
}

export const uploadAttachment = async(file: File) => {
    const formData = new FormData();
    formData.append("file", file)
    const response = await api.post<UploadAttachmentResponse>("/files/attachments/upload", formData);
    return response.data;
}

export const uploadDepartmentAttachment = async(file: File) => {
    const formData = new FormData();
    formData.append("file", file)
    const response = await api.post<UploadAttachmentResponse>("/files/groupattachments/upload/", formData);
    return response.data;
}

export const downloadAttachment = async(blobName: string) => {
    const response = await api.get<Blob>(`/files/attachments/download/${blobName}`, {
        responseType: "blob"
    });
    return response.data;
}

export const deleteAttachment = async(id: number) => {
    const response = await api.delete(`/files/attachments/${id}`);
    return response.data;
}