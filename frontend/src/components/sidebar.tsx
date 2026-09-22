import {Bell, Calendar, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, Hash, LayoutDashboard, LogOut, MessageSquareMoreIcon, User, Users, UserShield} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router';
import "../styles/sidebar.css"
import { useState, useRef, useEffect } from 'react';
import { getInitials } from '../services/getInitials';
import { stopConnection } from "../services/signalr";
import LogoutModal from './modals/logoutModal';
//import { useGetNotifications } from '../hooks/notificationHook';

type SidebarProps = {
    isCollapsed: boolean,
    toggleSidebar: () => void,
}
const Sidebar = ({isCollapsed, toggleSidebar}: SidebarProps) => {
    const navigate = useNavigate();
    //const notificationsQuery = useGetNotifications();
    //const unreadCount = notificationsQuery.data?.filter((n) => !n.isRead).length ?? 0;
    const [openLogoutModal, setOpenLogoutModal] = useState(false);
    const roles: string[] = JSON.parse(sessionStorage.getItem("roles") ?? "");
    const isAdmin = roles.includes("admin");
    const isManager = roles.includes("manager");
    const fullName = sessionStorage.getItem("fullName") ?? "User";
    const profilePictureUrl = sessionStorage.getItem("profilePictureUrl")
    const initials = getInitials(fullName)

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const navigations = [
        {label:"Dashboard", path:isAdmin ? "/admindashboard" : isManager ? "managerdashboard" : "regulardashboard", icon:LayoutDashboard},
        {label:"Employees", path:"/members", icon:Users},
        {label:"Messages", path:"/chat", icon:MessageSquareMoreIcon},
        {label:"Team Chat", path:"/departmentchat", icon:Hash},
        ...(isManager || isAdmin
            ? 
            [{label:"Tasks", path:"/teamtasks", icon:ClipboardCheck}] 
            : 
            [{label:"Tasks", path:"/mytasks", icon:ClipboardCheck}]),
        {label:"Calendar", path:"/calendar", icon:Calendar},
        {label: "Notifications", path:"/notifications", icon: Bell},
        ...(isAdmin ? [{label:"Administrator", path:"/admin", icon:UserShield}] : []),
    ];

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)){
            setMenuOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [])

    const handleLogout = async () => {
        await stopConnection();
        sessionStorage.clear();
        navigate("/");
    };

    return(
        <>
        <div className={`logo-btn ${isCollapsed ? `collapsed` : ``}`}>
            <button onClick={toggleSidebar} 
            className='sidebar-toggle-btn'
            aria-label={`${isCollapsed ? `Expand sidebar` : `Collapse sidebar`}`}
            >
            {isCollapsed ? 
            <ChevronRight size={27} color='rgb(118, 128, 158)' className='sidebar-icon'/> : 
            <ChevronLeft size={27} color='rgb(118, 128, 158)' className='sidebar-icon'/>
            }
            </button>
        </div>
        
        <div className="sidebar">
            <nav className='sidebar-nav'>
                {navigations.map(item => {
                    const Icon = item.icon;
                    return(
                        <>
                        <NavLink 
                            title={`${isCollapsed ? item.label : ``}`}
                            key={item.path} 
                            to={item.path} className={({isActive}) => 
                                isActive
                                ? `sidebar-link active ${isCollapsed ? `collapsed` : ``}`
                                : `sidebar-link ${isCollapsed ? `collapsed` : ``}`
                                }>
                                <Icon size={20} className='sidebar-icon'/>
                                {!isCollapsed && <span>{item.label}</span>}
                        </NavLink> 
                        </>
                    )
                })}        
            </nav>

            <div className="sidebar-user" ref={menuRef}>
                {menuOpen && (
                    <div className="sidebar-user-menu">
                        <button className="sidebar-user-menu-item" onClick={() => { navigate("/notifications"); setMenuOpen(false); }}>
                            <Bell size={16} className='sidebar-icon'/> {!isCollapsed && <span>Notifications</span>}
                        </button>
                        <button className="sidebar-user-menu-item" onClick={() => { navigate("/myprofile"); setMenuOpen(false); }}>
                            <User size={16} className='sidebar-icon'/> {!isCollapsed && <span>My Profile</span>}
                        </button>
                        <button className="sidebar-user-menu-item danger" onClick={() => setOpenLogoutModal(true)}>
                            <LogOut size={16} className='sidebar-icon'/> {!isCollapsed && <span>Logout</span>}
                        </button>
                    </div>
                )}
                <button className="sidebar-user-trigger" onClick={() => setMenuOpen(o => !o)}>
                    <span className="sidebar-avatar">
                        {profilePictureUrl ? <img src={profilePictureUrl}/> : initials}
                    </span>
                    {!isCollapsed && (
                    <div className="sidebar-user-info">
                        <span className="sidebar-user-name">{fullName}</span>
                        <span className="sidebar-user-role">{roles}</span>
                    </div>)
                    }
                    
                    {!isCollapsed && <ChevronDown size={16} className={menuOpen ? "chevron-open" : ""} />}
                </button>
            </div>
        </div>

        {openLogoutModal && <LogoutModal onClose={() => setOpenLogoutModal(false)} handleLogout={handleLogout}/>}
        </>
    )
}

export default Sidebar