import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateMember, deleteMember } from "../api/adminApi";

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMember,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMember,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    });
};