import { TaskStatus, type TaskResponse, type TaskStatusType } from "../types/types";

export const getTaskActions = (
    task: TaskResponse,
    currentUserId: string,
    isManagerOrAdmin: boolean
): { label: string; status: TaskStatusType }[] => {
    const isAssignee = task.assignedToId === currentUserId;
    const actions: { label: string; status: TaskStatusType }[] = [];

    if (isAssignee) {
        if (task.status === TaskStatus.NotStarted) actions.push({ label: "Start", status: TaskStatus.InProgress });
        if (task.status === TaskStatus.InProgress) {
            actions.push({ label: "Submit for Review", status: TaskStatus.InReview });
            actions.push({ label: "Mark Blocked", status: TaskStatus.Blocked });
        }
        if (task.status === TaskStatus.Blocked) actions.push({ label: "Resume", status: TaskStatus.InProgress });
    }

    if (isManagerOrAdmin && task.status === TaskStatus.InReview) {
        actions.push({ label: "Approve", status: TaskStatus.Completed });
        actions.push({ label: "Send Back", status: TaskStatus.InProgress });
    }

    return actions;
};