import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { loadMessages } from "../api/messageApi";
import type { PaginatedMessageResponse } from "../types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAttachment, downloadAttachment, deleteAttachment } from "../api/messageApi";

export const useMessageQuery = (otherUserId:string) => {
    return useInfiniteQuery({
        queryKey:["messages", otherUserId],
        queryFn: ({pageParam}) => loadMessages({otherUserId:otherUserId, encodedCursor:pageParam}),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage:PaginatedMessageResponse) => lastPage.nextCursor ?? undefined,
        placeholderData: keepPreviousData,
    })
}

export const useUploadAttachment = () => {
    return useMutation({
        mutationFn: uploadAttachment,
    });
};

export const useDownloadAttachment = () => {
    return useMutation({
        mutationFn: async ({ blobName, fileName }: { blobName: string; fileName: string }) => {
            const blob = await downloadAttachment(blobName);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = fileName;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        },
    });
};

export const useDeleteAttachment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAttachment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
};