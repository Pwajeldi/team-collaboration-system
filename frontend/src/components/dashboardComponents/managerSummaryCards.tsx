import { CalendarDays, FileCheck, Layers, Mail, Users } from "lucide-react";
import type { ManagerData } from "../../pages/managerDashboardPage"
import SummaryCard from "./summaryCard";

export type ManagerDashboardSummaryCardsProps = {
    data: ManagerData,
}

const ManagerDashboardSummaryCards = ({data}: ManagerDashboardSummaryCardsProps) => {
    const summaryCards = [
        {title: "My Team", value: data?.memberCount, icon: <Users/>},
        {title: "Tasks in Progress", value: data?.inProgress, icon: <Layers/>},
        {title: "Tasks to Review", value: data?.toReview, icon: <FileCheck/>},
        {title: "Today's Events", value: data?.eventsToday, icon: <CalendarDays/>},
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

export default ManagerDashboardSummaryCards