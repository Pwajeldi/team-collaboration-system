import { CalendarDays, FileCheck, Layers, Mail, TriangleAlert, } from "lucide-react";
import type { RegularData } from "../../pages/regularDashboardPAge";
import SummaryCard from "./summaryCard";

export type RegularDashboardSummaryCardsProps = {
    data: RegularData,
}

const RegularDashboardSummaryCards = ({data}: RegularDashboardSummaryCardsProps) => {
    const summaryCards = [
        {title: "Today's Events", value: data?.eventsToday, icon: <CalendarDays/>},
        {title: "Tasks in Progress", value: data?.inProgress, icon: <Layers/>},
        {title: "Tasks to Review", value: data?.inReview, icon: <FileCheck/>},
        {title: "Overdue", value: data?.overdue, icon: <TriangleAlert/>},
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

export default RegularDashboardSummaryCards