import type { CreateMemberDto, getMemberResponse, MemberQueryParams, PagedMembersResponse, UpdateMemberDto, UserList } from '../types/types'
import api from './axios'

export const getMember = async(id:string) => {
    const {data} = await api.get<getMemberResponse>(`team/${id}`);
    return data;
}

export const getMembers = async(page: number, pageSize: number, filters: MemberQueryParams) => {
    const {data} = await api.get<PagedMembersResponse>(`/team/members`, {
        params: {
            page: page,
            pageSize: pageSize,
            ...filters,
        }
    });
    return data;
}

export const deleteMember = async(id:string) => {
    const {data} = await api.delete(`team/delete/${id}`);
    return data;
}

export const createMember = async(payload: CreateMemberDto) => {
    const formData = new FormData();
    formData.append("firstName", payload.firstName);
    formData.append("lastName", payload.lastName);
    formData.append("email", payload.email);
    formData.append("jobTitle", payload.jobTitle);
    formData.append("departmentId", String(payload.department));
    formData.append("role", payload.role);
    formData.append("password", payload.password);
    formData.append("confirmPassword", payload.confirmPassword);
    if (payload.profilePicture) {
        formData.append("picture", payload.profilePicture);
    }
    const {data} =  await api.post("/team/create", formData);
    return data;
}

export const updateMember = async(id: string, payload: UpdateMemberDto) => {
    const {data} = await api.put(`/team/update/${id}`, payload);
    return data;
}

export const getUsersToDM = async(filters: MemberQueryParams) => {
    const {data} = await api.get<UserList[]>(`/team/listusers`, {
        params: {...filters}
    });
    return data;
}
