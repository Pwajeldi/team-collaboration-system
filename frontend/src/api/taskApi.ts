import type { AssignableMembers, CreateTaskDto, TaskQueryParams, TaskResponse, TaskStatusType, TaskSummaryResponse, UpdateTaskDto } from "../types/types";
import api from "./axios";


export const fetchTasks = async (queryParams: TaskQueryParams): Promise<TaskResponse[]> => {
    const { data } = await api.get<TaskResponse[]>("/task/tasks", {
        params: queryParams
    });
    return data;
};

export const fetchTask = async (id: string): Promise<TaskResponse> => {
    const { data } = await api.get<TaskResponse>(`/task/tasks/${id}`);
    return data;
};

export const createTask = async (payload: CreateTaskDto) => {
    const { data } = await api.post<TaskResponse>("/task/create", payload);
    return data;
};

export const updateTaskStatus = async ({ id, status }: { id: string; status: TaskStatusType })=> {
    const { data } = await api.patch<TaskResponse>(`/task/status/${id}`, {status});
    return data;
};

export const updateTask = async ({ id, payload }: { id: string; payload: UpdateTaskDto }) => {
    const { data } = await api.put<TaskResponse>(`/task/update/${id}`, payload);
    return data;
};

export const deleteTask = async (id: string) => {
    await api.delete<void>(`/task/delete/${id}`);
};

export const fetchAssignableMembers = async () => {
    const { data } = await api.get<AssignableMembers[]>("/task/team/assignable");
    return data;
};

export const fetchTaskSummary = async () => {
    const {data} = await api.get<TaskSummaryResponse>("/task/summary");
    return data;
}