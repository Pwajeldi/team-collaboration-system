import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { createTask, deleteTask, fetchTask, fetchTasks, fetchTaskSummary, updateTask, updateTaskStatus } from "../api/taskApi";
import type { TaskQueryParams } from "../types/types";
import { fetchAssignableMembers } from "../api/taskApi";
import toast from "react-hot-toast";

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useGetTasks = (params: TaskQueryParams = {}) => {
    return useQuery({
        queryKey: ["tasks", params],
        queryFn: () => fetchTasks(params),
    });
};

export const useGetTask = (id: string) => {
    return useQuery({
        queryKey: ["tasks", id],
        queryFn: () => fetchTask(id),
        enabled: !!id,
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useUpdateTaskStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTaskStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({queryKey: ["task-summary"]});
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useGetAssignableMembers = () => {
    return useQuery({
        queryKey: ["assignable-members"],
        queryFn: fetchAssignableMembers,
    });
};

export const useGetTaskSummary = () => {
    return useQuery({
        queryKey:["task-summary"],
        queryFn: fetchTaskSummary,
    })
}