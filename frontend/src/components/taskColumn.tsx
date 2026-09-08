import type { TaskResponse } from "../types/types"
import KanbanTaskCard from "./kanbanTaskCard"
import type { StatusId, TaskStatusTitle } from "./taskBoard"
import "../styles/taskColumn.css"


type TaskColumnProps = {
    columnId: StatusId,
    columnTitle: TaskStatusTitle,
    tasks: TaskResponse[],
}

const TaskColumn = ({ columnId, columnTitle, tasks }: TaskColumnProps) => {

    return (
        <div className="kanban-column" data-status={columnId}>
            <div className="kanban-column-header">
                <h3>{columnTitle}</h3>
                <span>{tasks.length}</span>
            </div>

            <div className="kanban-column-tasks">
                {tasks.length === 0 ? (
                    <p className="kanban-column-empty">No tasks</p>
                ) : (
                    tasks.map(task => <KanbanTaskCard key={task.id} task={task} />)
                )}
            </div>
        </div>
    )
}

export default TaskColumn