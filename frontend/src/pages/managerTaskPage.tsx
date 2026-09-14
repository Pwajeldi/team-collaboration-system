import { useState } from "react";
import { useUpdateTaskStatus, useDeleteTask, useGetTaskSummary } from "../hooks/taskHook";
import "../styles/managerTaskPage.css"
import { type TaskStatusType, type TaskResponse, TaskStatus, type TaskQueryParams, type TaskPriorityType } from "../types/types";
import { CircleCheck, Clock, ListTodo, Plus, TriangleAlert } from "lucide-react";
import TaskSummaryCard from "../components/tasks/taskSummaryCard";
import TaskList from "../components/tasks/taskList";
import TaskBoard from "../components/tasks/taskBoard";
import TaskFormModal from "../components/modals/taskFormModal";
import { TaskActionsProvider } from "../context/taskActionsContext";
import Loader from "../components/loader";

const statusLabel: Record<TaskStatusType, string> = {
    [TaskStatus.NotStarted]: "Not Started",
    [TaskStatus.InProgress]: "In Progress",
    [TaskStatus.InReview]: "In Review",
    [TaskStatus.Completed]: "Completed",
    [TaskStatus.Blocked]: "Blocked",
    [TaskStatus.Cancelled]: "Cancelled",
};
const priorities = ["Low", "Medium", "High"];

const ManagerTaskPage = () => {
    const taskSummaryQuery = useGetTaskSummary();
    const [tab, setTab] = useState<"board" | "list">("board");
    const summaryCards = [
        {title: "Total Tasks", value: taskSummaryQuery.data?.totalTasks, icon: <ListTodo/>, color: "", background:"#F1F5F9"},
        {title: "In Progress", value: taskSummaryQuery.data?.inProgressTasks, icon: <Clock/>, color:"#2563EB", background:"#EFF6FF"},
        {title: "Completed", value: taskSummaryQuery.data?.completedTasks, icon: <CircleCheck/>, color: "#16A34A", background:"#c2d1c7"},
        {title: "Overdue", value: taskSummaryQuery.data?.overdueTasks, icon: <TriangleAlert/>, color: "#DC2626", background:"#FEE2E2"},
    ]

    const [statusFilter, setStatusFilter] = useState<TaskStatusType | undefined>();
    const [search, setSearch] = useState("");
    const [priorityFilter, setPriorityFilter] = useState<TaskPriorityType | undefined>();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskResponse | undefined>(undefined);
    const filters: TaskQueryParams = {
        status: statusFilter,
        priority: priorityFilter,
        assigneeId: "",
        search: search,
    };

    const updateStatus = useUpdateTaskStatus();
    const deleteTask = useDeleteTask();


    const openCreate = () => {
        setEditingTask(undefined);
        setModalOpen(true);
    };

    const openEdit = (task: TaskResponse) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingTask(undefined);
    };

    const handleDelete = async (task: TaskResponse)=> {
        if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
        await deleteTask.mutateAsync(task.id);
    };

    const handleStatusChange = async (task: TaskResponse, status: TaskStatusType) => {
        await updateStatus.mutateAsync({ id: task.id, status });
    };

    if (taskSummaryQuery.isLoading) return <Loader />;
    if (taskSummaryQuery.isError) return <div className="tasks-error">Couldn't load tasks.</div>;

    return(
        <div className="tasks-page">
            <div className="tasks-header">
                <div>
                    <p className="tasks-title">Tasks</p>
                    <p className="tasks-subtitle">
                        Manage and track your team's work.
                    </p>
                </div>
                    <button className="tasks-btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Assign Task
                    </button>
            </div>

            <div className="tasks-filters">
                <input
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatusType ?? "")}>
                    <option value="">All statuses</option>
                    {Object.entries(statusLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriorityType ?? "")}>
                    <option value="">All</option>
                    {priorities.map((priority,index) => (
                        <option key={index} value={priority}>{priority}</option>
                    ))}
                </select>
            </div>

            <div className="regular-task-container">
            <div className="summary-grid">
                {summaryCards.map(card => (
                    <TaskSummaryCard key={card.title} {...card}/>
                ))}
                
            </div>

            <div className="task-tabs">
                <button className={`task-tab ${tab==="board" ? "active" : ""}`} onClick={() => setTab("board")}>Board</button>
                <button className={`task-tab ${tab==="list" ? "active" : ""}`} onClick={() => setTab("list")}>List</button>
            </div>
            
            <div>
                {tab === "board" && 
                <TaskActionsProvider changeStatus={handleStatusChange} deleteTask={handleDelete} openEdit={openEdit}>
                    <TaskBoard filters={filters} />
                </TaskActionsProvider>}
                {tab === "list" 
                && <TaskList 
                    changeStatus={handleStatusChange} 
                    deleteTask={handleDelete} 
                    openEdit={openEdit}
                    filters={filters}/>
                }
            </div>
        </div>
            {modalOpen && (
                <TaskFormModal
                    task={editingTask}
                    onClose={closeModal}
                    onSuccess={closeModal}
                />
            )}
        </div>
    )
}

export default ManagerTaskPage