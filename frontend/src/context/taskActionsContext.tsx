// contexts/TaskActionsContext.tsx
import { createContext, useContext, type ReactNode } from "react";
import { getUserId } from "../services/jwtdecode";
import { getTaskActions } from "../services/getTaskActions";
import type { TaskResponse, TaskStatusType } from "../types/types";

type TaskActionsContextType = {
    isManagerOrAdmin: boolean;
    changeStatus: (task: TaskResponse, status: TaskStatusType) => Promise<void>;
    deleteTask: (task: TaskResponse) => Promise<void>;
    openEdit: (task: TaskResponse) => void;
    getActions: (task: TaskResponse) => { label: string; status: TaskStatusType }[];
};

const TaskActionsContext = createContext<TaskActionsContextType | null>(null);

type TaskActionsProviderProps = {
    changeStatus: (task: TaskResponse, status: TaskStatusType) => Promise<void>;
    deleteTask: (task: TaskResponse) => Promise<void>;
    openEdit: (task: TaskResponse) => void;
    children: ReactNode;
};

export const TaskActionsProvider = ({ changeStatus, deleteTask, openEdit, children }: TaskActionsProviderProps) => {
    const role = (sessionStorage.getItem("role") ?? "").toLowerCase();
    const isManagerOrAdmin = role === "manager" || role === "admin";
    const currentUserId = getUserId() ?? "";

    const value: TaskActionsContextType = {
        isManagerOrAdmin,
        changeStatus,
        deleteTask,
        openEdit,
        getActions: (task) => getTaskActions(task, currentUserId, isManagerOrAdmin),
    };

    return <TaskActionsContext.Provider value={value}>{children}</TaskActionsContext.Provider>;
};


export const useTaskActions = () => {
    const ctx = useContext(TaskActionsContext);
    if (!ctx) throw new Error("useTaskActions must be used within a TaskActionsProvider");
    return ctx;
};