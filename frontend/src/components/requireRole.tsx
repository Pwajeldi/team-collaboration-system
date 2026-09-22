
import { Navigate } from "react-router";
import type { ReactNode } from "react";

type RequireRoleProps = {
    role: string[];
    children: ReactNode;
};

const RequireRole = ({ role, children }: RequireRoleProps) => {
    const UserRoles: string[] = JSON.parse(sessionStorage.getItem("roles")?.toLocaleLowerCase() ?? "");
    const hasRequiredRole = role.some((r) => UserRoles.includes(r))
    if (role && !hasRequiredRole) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

export default RequireRole;