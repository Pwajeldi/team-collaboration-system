import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMyProfile, updateMyProfile } from "../api/profileApi"


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
        }
    })
}
