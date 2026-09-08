import RecentMessages from "../components/dashboardComponents/recentMessages";
import AdminDashboardSummaryCards from "../components/dashboardComponents/adminSummaryCards";
import TaskActivityChart from "../components/dashboardComponents/taskActivityChart";
import TodayEvents from "../components/dashboardComponents/todayEvents";
import { useFetchDashboard } from "../hooks/dashboardHook";
import "../styles/dashboard.css"
import type { ManagerDashboardResponse } from "../types/types";
import Loader from "../components/loader";
import { getGreeting } from "../services/getInitials";

export type AdminData = {
    managerData?: ManagerDashboardResponse,
    memberCount?: number,
    departmentCount?: number,
    unreadMessages: number,
}

const AdminDashboardPage = () => {
    const dashboardQuery = useFetchDashboard();
    const data = dashboardQuery.data?.adminDashboardResponse;
    const adminData: AdminData = {
        managerData: data?.responseAsManager,
        memberCount: data?.allMembersCount,
        departmentCount: data?.departmentCount,
        unreadMessages: data?.unreadMessageCount ?? 0,
    };

    if(dashboardQuery.isLoading) {
        return(
           <Loader/>
        )
    };

    const firstName = adminData.managerData?.firstName ?? "User";
    
    return(
        <div className="dashboard">
            <h1>{getGreeting()}, {firstName}</h1>
            
            <div className="summary-grid">
                <AdminDashboardSummaryCards data={adminData}/>
            </div>

            <div className="activity-chart">
                <TaskActivityChart data={data?.taskActivity ?? []}/>
            </div>

            <div className="today-events">
                <TodayEvents data={data?.responseAsManager.todayEvents ?? []}/>
            </div>
            
            <div className="recent-messages">
                <RecentMessages data={data?.responseAsManager.recentMessages ?? []}/>
            </div>
        </div>
    )
}

export default AdminDashboardPage