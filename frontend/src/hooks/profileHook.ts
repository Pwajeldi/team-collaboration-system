import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchUserProfile, getMyProfile, resetPassword, updateMyProfile, uploadProfilePicture } from "../api/profileApi"
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

export const useUploadProfilePicture = () => {
    return useMutation({
        mutationFn: uploadProfilePicture,
        onSuccess:(data) => {
            toast.success(`${data}`);
        },
        onError:(error) => {
            toast.error(`${error.message}`);
        },
    })
}

export const useFetchUserProfile = (userId: string) => {
    return useQuery({
        queryKey:["user-profile", userId],
        queryFn:() => fetchUserProfile(userId),
        placeholderData: keepPreviousData, 
    })
}
