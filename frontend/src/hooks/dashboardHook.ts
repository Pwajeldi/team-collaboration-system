import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { fetchDashboard } from "../api/dashboardApi"

export const useFetchDashboard = () => {
    return useQuery({
        queryKey:["dashboard"],
        queryFn: fetchDashboard,
        placeholderData: keepPreviousData,
    })
};