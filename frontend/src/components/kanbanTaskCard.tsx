import type { TaskResponse } from "../types/types"
import "../styles/kanbanTaskCard.css"
import TaskActionsMenu from "./taskActionMenu"
import { useTaskActions } from "../context/taskActionsContext"
import { useDraggable } from "@dnd-kit/react"
type KanbanTaskCardProps = {
    task: TaskResponse
}

const KanbanTaskCard = ({ task }: KanbanTaskCardProps) => {
    const { isManagerOrAdmin, changeStatus, openEdit, deleteTask, getActions } = useTaskActions();
    const drag = useDraggable({
        id: task.id,
    })
    return (
        <div className="task-card" ref={drag.ref}>
            <div className="task-card-top">
                <h4>{task.title}</h4>
                <TaskActionsMenu
                    task={task}
                    actions={getActions(task)}
                    isManagerOrAdmin={isManagerOrAdmin}
                    onChangeStatus={changeStatus}
                    onEdit={openEdit}
                    onDelete={deleteTask}
                />
            </div>
            {task.description && <p>{task.description}</p>}
            <div className="task-progress">
                <div className="progress-info">
                    <span>Progress</span>
                    <span>{task.progress}%</span>
                </div>
                <div className="progress-track">
                    <div className="progress-bar" style={{ width: `${task.progress}%` }} />
                </div>
            </div>
            <div className="task-card-footer">
                <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className="task-card-assignee">{task.assignedToName}</span>
            </div>
        </div>
    );
};

export default KanbanTaskCard
    
