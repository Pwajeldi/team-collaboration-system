import { CalendarDays, FileCheck, Mail, Users } from "lucide-react";
import type { AdminData } from "../../pages/adminDashboardPage";
import SummaryCard from "./summaryCard";

export type AdminDashboardSummaryCardsProps = {
    data: AdminData,
}

const AdminDashboardSummaryCards = ({data}: AdminDashboardSummaryCardsProps) => {
    const summaryCards = [
        {title: "Total Employees", value: data?.memberCount, icon: <Users/>},
        {title: "Today's Events", value: data?.managerData?.eventsTodayCount, icon: <CalendarDays/>},
        {title: "Tasks to Review", value: data?.managerData?.teamTaskSummary?.inReviewTasks, icon: <FileCheck/>},
        {title: "Unread Messages", value: data?.unreadMessages, icon: <Mail/>},
    ];

    return(
        <>
            {summaryCards.map(card => (
                <SummaryCard key={card.title} {...card}/>
            ))}
        </>
    )
}

export default AdminDashboardSummaryCards