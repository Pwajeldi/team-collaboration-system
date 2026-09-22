import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateMember, deleteMember, assignRole, removeRole, deactivateMember, activateMember } from "../api/adminApi";
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

export const useDeactivateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deactivateMember,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useActivateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: activateMember,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useAssignRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: assignRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    });
};

export const useRemoveRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeRole,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    });
};