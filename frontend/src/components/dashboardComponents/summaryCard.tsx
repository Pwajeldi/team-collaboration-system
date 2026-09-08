import type { ReactNode } from "react"

type SummaryCardProp = {
    title?: string,
    value?: number,
    icon?: ReactNode,
}

const SummaryCard = ({title, value, icon}: SummaryCardProp) => {
    return(
        <div className="dashboard-card">
            <div className="summary-card-header">
                <p>{title}</p>
                {icon}
            </div>
            <h2>{value ?? ""}</h2>
        </div>
    )
}

export default SummaryCard