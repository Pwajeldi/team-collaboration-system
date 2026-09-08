import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchDepartments, loadDepartmentMessages } from "../api/departmentApi"
import api from "../api/axios";

export const useDeleteDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
    });
}

export const useFetchDepartments = () => {
    return useQuery({
        queryKey: ["departments"],
        queryFn: fetchDepartments, 
    });
};

export const useDepartmentMessageQuery = () => {
    return useInfiniteQuery({
        queryKey: ["department-messages"],
        queryFn: ({ pageParam }) => loadDepartmentMessages(pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.NextCursor ?? undefined,
        placeholderData: keepPreviousData,
    });
};

const createDepartment = async (departmentName: string) => {
    const { data } = await api.post("/department/create", JSON.stringify(departmentName), {
        headers: { "Content-Type": "application/json" },
    });
    return data;
};

const deleteDepartment = async (departmentId: number) => {
    await api.delete(`/department/delete/${departmentId}`);
};

export const useCreateDepartment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDepartment,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
    });
};