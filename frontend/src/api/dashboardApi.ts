import type { FetchDashboardResponse } from "../types/types";
import api from "./axios"

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const fetchDashboard = async() => {
    const response = await api.get<FetchDashboardResponse>(`/dashboard`, {
        params:{
            timeZone: timeZone,
        }
    });
    return response.data;
}