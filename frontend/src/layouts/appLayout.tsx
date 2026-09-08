import Sidebar from "../components/sidebar"
import { Outlet } from "react-router"
import "../styles/appLayout.css"
import { useChatSocket } from "../hooks/useChatSocket"
import { useState } from "react"

const AppLayout = () => {
    useChatSocket();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    }
    return(
    <div className={`layout ${isCollapsed ? `sidebar-collapsed` : ``}`}>
        <aside className={`layout-sidebar`}>
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar}/>
        </aside>

        <main className="layout-main">
            <Outlet/>
        </main>
    </div>
    )
}

export default AppLayout