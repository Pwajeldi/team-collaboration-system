import type { ReactNode } from "react"
import "../../styles/taskSummaryCard.css"

type SummaryCardProps = {
    title: string,
    value: number | undefined,
    icon: ReactNode,
    color: string,
    background: string,
}

const TaskSummaryCard = ({title, value, icon, color, background}:SummaryCardProps) => {
    return(
        <div className="summary-card">
            <div className="summary-card-header">
                <p>{title}</p>
                {icon}
            </div>
            <div className="task-value-wrapper" style={{ backgroundColor:`${background}`}}>
                <h2 style={{color:`${color}`}}>{value ?? ""}</h2>
            </div>
        </div>
    )
}

export default TaskSummaryCard