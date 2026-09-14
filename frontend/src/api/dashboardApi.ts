import axios from "axios";
import type { FetchDashboardResponse } from "../types/types";
import api from "./axios"

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const fetchDashboard = async() => {
    try{
        const response = await api.get<FetchDashboardResponse>(`/dashboard`, {
            params:{
                timeZone: timeZone,
            }
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