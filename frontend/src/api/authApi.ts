
import type { LoginResponse } from "../types/types";
import  api  from "./axios";

export const login = async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
    return data;
}

type Roles = {
    id: string,
    name: string
}

export const fetchRoles = async() => {
    const {data} = await api.get<Roles[]>(`/auth/roles`);
    return data;
}

export const refreshTokens = async() => {
    const {data} = await api.post<string>(`/auth/refresh`);
    return data;
}
