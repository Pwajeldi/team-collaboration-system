import type { ReactNode } from "react"
import "../styles/taskSummaryCard.css"

type SummaryCardProps = {
    title: string,
    value: number | undefined,
    description?: string,
    icon: ReactNode
}

const TaskSummaryCard = ({title, value, description, icon}:SummaryCardProps) => {
    return(
        <div className="summary-card">
            <div className="summary-card-header">
                <p>{title}</p>
                {icon}
            </div>
            <h2>{value ?? ""}</h2>
            {description && <span>{description}</span>}
        </div>
    )
}

export default TaskSummaryCard