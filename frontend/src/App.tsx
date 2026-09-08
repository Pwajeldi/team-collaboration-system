import LoginPage from './pages/loginPage'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router'
import {Toaster} from 'react-hot-toast'
import AdminDashboardPage from './pages/adminDashboardPage'
import AppLayout from './layouts/appLayout'
import MembersPage from './pages/memberPage'
import Calendar from './pages/calendarPage'
import ChatLayout from './layouts/chatLayout'
import Administrator from './pages/adminPage'
import DepartmentChatPage from './pages/depChatPage'
import RequireRole from './components/requireRole'
import RegularTaskPage from './pages/regularTaskPage'
import ManagerTaskPage from './pages/managerTaskPage'
import ManagerDashboardPage from './pages/managerDashboardPage'
import RegularDashboardPage from './pages/regularDashboardPAge'
import MyProfile from './pages/profilePage'


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('accessToken')
  return token ? <>{children}</> : <Navigate to="/login" />
}

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage/>, handle: { title: "Login" } },
  { path: "/", element: <Navigate to="/login"/> },
  {
    element: <ProtectedRoute><AppLayout/></ProtectedRoute>,
    children: [
      { path: "/admindashboard", element: (<RequireRole role={["admin"]}><AdminDashboardPage/></RequireRole>), handle: { title: "Administrator" } },
      { path: "/regulardashboard", element: (<RequireRole role={["regular"]}><RegularDashboardPage/></RequireRole>), handle: { title: "Dashboard" } },
      { path: "/managerdashboard", element: (<RequireRole role={["manager"]}><ManagerDashboardPage/></RequireRole>), handle: { title: "Manager" } },
      { path: "/members", element: (<MembersPage/>), handle: { title: "The Team" } },
      { path: "/chat", element: (<ChatLayout/>), handle: { title: "Messages" } },
      { path: "/departmentchat", element: <DepartmentChatPage/>, handle: { title: "Team Chat" } },
      { path: "/teamtasks", element: (<RequireRole role={["manager","admin"]}><ManagerTaskPage/></RequireRole>), handle: { title: "Task Overview" } },
      { path: "/mytasks", element: <RegularTaskPage/>, handle: { title: "Task Overview" }},
      { path: "/calendar", element: <Calendar/>, handle: { title: "Calendar" } },
      { path: "/myprofile", element: <MyProfile/>, handle: { title: "Profile" } },
      { path: "/admin", element: (<RequireRole role={["admin"]}><Administrator/></RequireRole>), handle: { title: "Administrator" } },
    ],
  },
]);

function App() {

  return (
    <>
    <Toaster position="top-center" reverseOrder={false}/>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
