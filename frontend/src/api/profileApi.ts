import type { UpdateProfileDto, UserProfileResponse } from "../types/types";
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
    const response = await api.put(`/profile/update/`, payload);
    return response.data;
}