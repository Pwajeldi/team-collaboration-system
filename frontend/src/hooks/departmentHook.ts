import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createDepartment, deleteDepartment, fetchDepartments, loadDepartmentMessages } from "../api/departmentApi"
import toast from "react-hot-toast";

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
        onError: (error) => toast.error(`${error.message}`),
    });
}

export const useFetchDepartments = () => {
    return useQuery({
        queryKey: ["departments"],
        queryFn: fetchDepartments,
        staleTime: 10*60_000, 
    });
};

export const useDepartmentMessageQuery = () => {
    return useInfiniteQuery({
        queryKey: ["department-messages"],
        queryFn: ({ pageParam }) => loadDepartmentMessages(pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage?.NextCursor ?? undefined,
        placeholderData: keepPreviousData,
    });
};


export const useCreateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
        onError: (error) => toast.error(`${error.message}`),
    });
};