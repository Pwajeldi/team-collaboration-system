import type { DepartmentResponse, createDepartmentDto, PaginatedDepartmentMessageResponse } from "../types/types";
import api from "./axios";

export const fetchDepartments = async() => {
    const {data} = await api.get<DepartmentResponse[]>(`/department/get`);
    return data;
}

export const loadDepartmentMessages = async (encodedCursor?: string) => {
    const { data } = await api.get<PaginatedDepartmentMessageResponse>("/department/messages", {
        params: encodedCursor ? { encodedCursor } : {},
    });
    return data;
};

export const createDepartment = async(payload: createDepartmentDto) => {
    const {data} = await api.post(`/department/create`, payload);
    return data;
}

export const deleteDepartment = async(depId: string) => {
    const {data} = await api.delete(`/department/delete`, {
        params:{
            departmentId: depId
        }
    });
    return data;
}