import ManagerDashboardSummaryCards from "../components/dashboardComponents/managerSummaryCards";
import RecentMessages from "../components/dashboardComponents/recentMessages";
import TodayEvents from "../components/dashboardComponents/todayEvents";
import Loader from "../components/loader";
import { useFetchDashboard } from "../hooks/dashboardHook"
import { getGreeting } from "../services/getInitials";

export type ManagerData = {
    memberCount?: number,
    eventsToday?: number,
    inProgress?: number,
    toReview?: number,
    unreadMessages: number;
};

const ManagerDashboardPage = () => {
    const dashboardQuery = useFetchDashboard();
    const data = dashboardQuery.data?.managerDashboardResponse;
    const managerData: ManagerData = {
        memberCount: data?.teamMemberCount,
        eventsToday: data?.todayEvents?.length,
        inProgress: data?.teamTaskSummary?.inProgressTasks,
        toReview: data?.teamTaskSummary?.inReviewTasks,
        unreadMessages: data?.unreadMessageCount ?? 0,
    }
    const firstName = data?.firstName ?? "";
    
    if(dashboardQuery.isLoading) {
        return(
            <div style={{display:"flex", alignItems:"center", justifyContent:"center"}}>
                <Loader />
            </div>
        )
    };

    return(
        <div className="dashboard">
            <h1>{getGreeting()}, {firstName}</h1>
            <div className="summary-grid">
                <ManagerDashboardSummaryCards data={managerData}/>
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

export default ManagerDashboardPage