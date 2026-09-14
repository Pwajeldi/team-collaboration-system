import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { loadMessages, uploadDepartmentAttachment } from "../api/messageApi";
import type { PaginatedMessageResponse } from "../types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAttachment, downloadAttachment, deleteAttachment } from "../api/messageApi";
import toast from "react-hot-toast";

export const useMessageQuery = (otherUserId:string) => {
    return useInfiniteQuery({
        queryKey:["messages", otherUserId],
        queryFn: ({pageParam}) => loadMessages({otherUserId:otherUserId, encodedCursor:pageParam}),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage?:PaginatedMessageResponse) => lastPage?.nextCursor ?? undefined,
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })
}

export const useUploadAttachment = () => {
    return useMutation({
        mutationFn: uploadAttachment,
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useUploadDepartmentAttachment = () => {
    return useMutation({
        mutationFn: uploadDepartmentAttachment,
        onError: (error) => toast.error(`${error.message}`),
    })
}

export const useDownloadAttachment = () => {
    return useMutation({
        mutationFn: async ({ blobName, fileName }: { blobName: string; fileName: string }) => {
            const blob = await downloadAttachment(blobName);
            const url = URL.createObjectURL(blob!);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useDeleteAttachment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAttachment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};