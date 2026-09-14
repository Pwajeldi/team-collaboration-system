import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateMember, deleteMember } from "../api/adminApi";
import toast from "react-hot-toast";

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMember,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMember,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
        onError: (error) => toast.error(`${error.message}`),
    });
};