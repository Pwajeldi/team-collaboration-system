
import { Navigate } from "react-router";
import type { ReactNode } from "react";

type RequireRoleProps = {
    role: string[];
    children: ReactNode;
};

const RequireRole = ({ role, children }: RequireRoleProps) => {
    const userRole = (sessionStorage.getItem("role") ?? "").toLowerCase();
    if (role && !role.includes(userRole ?? "")) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

export default RequireRole;