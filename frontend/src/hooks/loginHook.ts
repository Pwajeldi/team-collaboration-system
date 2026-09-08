import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query"
import { fetchRoles, login } from "../api/authApi"


export const useLogin = () => {
    return useMutation({
        mutationFn:async({email, password}:{email:string, password:string}) => login(email, password),
    })
};

export const useFetchRoles = () => {
    return useQuery({
        queryKey:["roles"],
        queryFn: fetchRoles,
        staleTime: Infinity,
        placeholderData: keepPreviousData
    })
}