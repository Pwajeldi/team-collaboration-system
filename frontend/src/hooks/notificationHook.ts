// hooks/notificationHook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyNotifications, sendNotification, markNotificationRead } from "../api/notificationApi";
import type { NotificationResponseDto } from "../types/types";
import toast from "react-hot-toast";

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: fetchMyNotifications,
        staleTime: Infinity,
    });
};

export const useSendNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: sendNotification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
        onError:(error) => {toast.error(`${error.message}`)}
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markNotificationRead,
        // optimistic — no need to wait on a round trip for your own read state
        onMutate: async (id: string) => {
            queryClient.setQueryData<NotificationResponseDto[]>(["notifications"], (old = []) =>
                old.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        },
    });
};