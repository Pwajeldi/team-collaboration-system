import RecentMessages from "../components/dashboardComponents/recentMessages";
import RegularDashboardSummaryCards from "../components/dashboardComponents/regularSummaryCards";
import TodayEvents from "../components/dashboardComponents/todayEvents";
import Loader from "../components/loader";
import { useFetchDashboard } from "../hooks/dashboardHook"
import { getGreeting } from "../services/getInitials";

export type RegularData = {
    inReview?: number,
    eventsToday?: number,
    inProgress?: number,
    overdue?: number,
    unreadMessages: number;
};

const RegularDashboardPage = () => {
    const dashboardQuery = useFetchDashboard();
    const data = dashboardQuery.data?.regularDashboardResponse;
    const regularData: RegularData = {
        eventsToday: data?.todayEvents?.length,
        inProgress: data?.taskSummary?.inProgressTasks,
        overdue: data?.taskSummary?.overdueTasks,
        inReview: data?.taskSummary?.inReviewTasks,
        unreadMessages: data?.unreadMessageCount ?? 0,
    };
    const firstName = data?.firstName ?? "";
    if(dashboardQuery.isLoading) {
        return(
            <Loader/>
        )
    };

    return(
        <div className="dashboard">
            <h1>{getGreeting()}, {firstName}</h1>
            <div className="summary-grid">
                <RegularDashboardSummaryCards data={regularData}/>
            </div>
            <div className="today-events">
                <TodayEvents data={data?.todayEvents ?? []}/>
            </div>
            <div className="recent-messages">
                <RecentMessages data={data?.recentMessages ?? []}/>
            </div>
        </div>
    )
}

export default RegularDashboardPage