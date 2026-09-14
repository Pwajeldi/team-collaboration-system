import { columnFilteringFeature, coreRowModelsFeature, createColumnHelper, FlexRender, rowPaginationFeature, rowSelectionFeature, rowSortingFeature, tableFeatures, useTable } from "@tanstack/react-table";
import { CircleAlert } from "lucide-react";
import { useGetTasks } from "../../hooks/taskHook";
import { TaskStatus, type TaskQueryParams, type TaskResponse, type TaskStatusType } from "../../types/types";
import { getUserId } from "../../services/jwtdecode";
import "../../styles/tasksPage.css";
import TaskActionsMenu from "./taskActionMenu";
import { getTaskActions } from "../../services/getTaskActions";

const features = tableFeatures({
    columnFilteringFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    coreRowModelsFeature,
})

const columnHelper = createColumnHelper<typeof features, TaskResponse>();
const statusLabel: Record<TaskStatusType, string> = {
    [TaskStatus.NotStarted]: "Not Started",
    [TaskStatus.InProgress]: "In Progress",
    [TaskStatus.InReview]: "In Review",
    [TaskStatus.Completed]: "Completed",
    [TaskStatus.Blocked]: "Blocked",
    [TaskStatus.Cancelled]: "Cancelled",
};
const dateOption: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
};
export type TaskListProps = {
    changeStatus:(task: TaskResponse, status: TaskStatusType) => Promise<void>;
    deleteTask:(task: TaskResponse) => Promise<void>;
    openEdit:(task: TaskResponse) => void;
    filters: TaskQueryParams
}

const TaskList = ({changeStatus, deleteTask, openEdit, filters}: TaskListProps) => {
    const taskQuery = useGetTasks(filters);
    const role = (sessionStorage.getItem("role") ?? "").toLowerCase();
    const isManager = role === "manager";
    const isManagerOrAdmin = role === "manager" || role === "admin";
    const currentUserId = getUserId() ?? "";

    const columns = columnHelper.columns([
        columnHelper.accessor("title", {header:"TITLE", cell:(info) => info.getValue()}),
        ...(isManager ? [columnHelper.accessor("assignedToName", {header:"Assignee", cell:(info) => info.getValue()})] : []),
        columnHelper.accessor("priority", {header:"Priority", cell:(info) => {
            const priority = info.getValue();
            return(
                <span className={`priority-badge priority-${priority.toLowerCase()}`}>
                    {priority}
                </span>
            )
        }
        }),
        columnHelper.accessor("status", {header:"Status", cell:(info) => {
            const task = info.getValue();
            return(
                <span className={`status-badge status-${task.toLowerCase()}`}>
                    {task === TaskStatus.Blocked && <CircleAlert size={12} />}
                    {statusLabel[task]}
                </span>
            )
        }}),
        columnHelper.accessor("progress", {header:"Progress", cell:(info) => (
            info.getValue().toString() + "%")
        }),
        columnHelper.accessor("dueDate", 
            {header: "DUE DATE", 
            cell:(info) => {
                const dueDate = info.getValue();
                return dueDate ? new Date(dueDate).toLocaleDateString("en-US", dateOption) : "-";
            }
        }),
        columnHelper.display({ id: "actions", header: "Actions",
            cell: ({row}) => {
                return(
                   <div className="task-actions-cell">
                            <TaskActionsMenu
                                task={row.original}
                                actions={getTaskActions(row.original, currentUserId, isManagerOrAdmin)}
                                isManagerOrAdmin={isManagerOrAdmin}
                                onChangeStatus={changeStatus}
                                onEdit={openEdit}
                                onDelete={deleteTask}
                            />
                    </div>
                )
            } 
        })
        ])

        const table = useTable({
            features,
            columns,
            data: taskQuery.data ?? []
        })

        if (taskQuery.isLoading) return <div className="loading"></div>;
        if (taskQuery.isError) return <div className="tasks-error">Couldn't load tasks.</div>;
        
        return(
        <div className="table-container">
            <table>
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    <FlexRender header={header}/>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {taskQuery.data?.length === 0 && (
                        <tr>
                            <td colSpan={6} className="tasks-empty">No tasks found.</td>
                        </tr>
                    )}
                    {table.getRowModel().rows.map(row => {
                        return(
                            <tr key={row.id}>
                                {row.getAllCells().map(cell => (
                                    <td key={cell.id}>
                                        <FlexRender cell={cell}/>
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
                
            </table>
        </div>
    )
}

export default TaskList