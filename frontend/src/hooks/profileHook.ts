import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMyProfile, resetPassword, updateMyProfile } from "../api/profileApi"
import toast from "react-hot-toast"


export const useGetMyProfile = () => {
    return useQuery({
        queryKey:["myProfile"],
        queryFn: getMyProfile,
        placeholderData: keepPreviousData,
    })
}

export const useUpdateMyProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMyProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["myProfile"]})
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: resetPassword,
        onSuccess: () => {
            toast.success("Password reset successfully");
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
}
