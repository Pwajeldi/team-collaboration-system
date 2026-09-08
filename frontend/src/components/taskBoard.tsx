import { useGetTasks } from "../hooks/taskHook";
import TaskColumn from "./taskColumn";
import "../styles/taskBoard.css";
import type { TaskQueryParams } from "../types/types";
import Loader from "./loader";
import { Droppable } from "../services/droppableBoard";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import toast from "react-hot-toast";
import { useTaskActions } from "../context/taskActionsContext";


export type TaskStatusTitle = "Not Started" | "In Progress" | "In Review" | "Completed";
export type StatusId = "NotStarted" | "InProgress" | "InReview" | "Completed";
type KanbanColumn = {
    id: StatusId;
    title: TaskStatusTitle;
};
const columns: KanbanColumn[] = [
    {id:"NotStarted", title:"Not Started"},
    {id:"InProgress", title:"In Progress"},
    {id:"InReview", title:"In Review"},
    {id:"Completed", title:"Completed"},
];

const TaskBoard = ({filters}: {filters:TaskQueryParams}) => {
    const taskQuery = useGetTasks(filters);
    const { changeStatus, getActions } = useTaskActions();

    const handleDragEnd = (event: DragEndEvent) => {
        const { source, target } = event.operation;
        if (!source || !target) return;

        const taskId = source.id as string;
        const newStatus = target.id as StatusId;

        const task = taskQuery.data?.find(t => t.id === taskId);
        if (!task || task.status === newStatus) return;

        const allowed = getActions(task).some(action => action.status === newStatus);
        if (!allowed) {
            toast.error(`Move to next stage`);
            return;
        }

        changeStatus(task, newStatus);
    };

    if (taskQuery.isLoading) return <Loader/>;
    if (taskQuery.isError) return <div className="tasks-error">Couldn't load tasks.</div>;
    return(
        <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="task-board">
            {columns.map(column => {
                const columnTasks = taskQuery.data?.filter(t => t.status === column.id);
                return(
                    <Droppable key={column.id} id={column.id}>
                    <TaskColumn key={column.id} columnId={column.id} columnTitle={column.title} tasks={columnTasks ?? []}/>
                    </Droppable>
                )
            })}
        </div>
        </DragDropProvider>
    );
};

export default TaskBoard;