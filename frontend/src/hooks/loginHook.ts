import {keepPreviousData, useMutation, useQuery} from "@tanstack/react-query"
import { changePassword, fetchRoles, forgotPassword, login } from "../api/authApi"


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

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
    })
}

export const useChangePassword = () => {
    return useMutation({
        mutationFn: changePassword,
    })
}