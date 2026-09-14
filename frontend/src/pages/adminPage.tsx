import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import NewUserForm from "../components/modals/newUserForm";
import EditMemberModal from "../components/modals/editMemberModal";
import AdminUsersTable from "../components/adminUsersTable";
import { useFetchDepartments, useCreateDepartment, useDeleteDepartment } from "../hooks/departmentHook";
import type { getMemberResponse } from "../types/types";
import "../styles/adminPage.css";

const Administrator = () => {
    const [tab, setTab] = useState<"users" | "departments">("users");
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [editingMember, setEditingMember] = useState<getMemberResponse | null>(null);
    const [newDeptName, setNewDeptName] = useState("");

    const departmentsQuery = useFetchDepartments();
    const createDepartment = useCreateDepartment();
    const deleteDepartment = useDeleteDepartment();

    const handleCreateDepartment = async () => {
        if (!newDeptName.trim()) return;
        await createDepartment.mutateAsync(newDeptName.trim());
        setNewDeptName("");
    };

    const handleDeleteDepartment = async (id: number, name: string) => {
        if (!window.confirm(`Delete "${name}"? Members in this department will need reassigning.`)) return;
        await deleteDepartment.mutateAsync(id);
    };

    const button = document.getElementsByClassName("create-user-btn");
    button?.item(0)?.addEventListener("click", ()=>console.log("buton clicked"));

    return (
        <div className="admin-page">
            <div className="admin-tabs">
                <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
                <button className={tab === "departments" ? "active" : ""} onClick={() => setTab("departments")}>Departments</button>
            </div>

            {tab === "users" && (
                <div className="admin-section">
                    <div className="admin-section-header">
                        <p className="admin-section-title">Team members</p>
                        <button id="btn" className="create-user-btn" onClick={() => setShowCreateUser(true)}>
                            <Plus size={16} /> Create User
                        </button>
                    </div>
                    <AdminUsersTable onEdit={setEditingMember} />
                </div>
            )}

            {tab === "departments" && (
                <div className="admin-section">
                    <div className="admin-section-header">
                        <p className="admin-section-title">Departments</p>
                    </div>

                    <div className="dept-create-row">
                        <input
                            placeholder="New department name"
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                        />
                        <button className="create-user-btn" onClick={handleCreateDepartment} disabled={createDepartment.isPending}>
                            <Plus size={16} /> Add Department
                        </button>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Department</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departmentsQuery.data?.length === 0 && (
                                    <tr><td colSpan={2} className="admin-empty">No departments yet.</td></tr>
                                )}
                                {departmentsQuery.data?.map((d) => (
                                    <tr key={d.departmentId}>
                                        <td>{d.departmentName}</td>
                                        <td>
                                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                <button
                                                    className="table-contols-btn danger"
                                                    onClick={() => handleDeleteDepartment(d.departmentId, d.departmentName)}
                                                    aria-label="Delete department"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showCreateUser && (
                <NewUserForm onSuccess={() => setShowCreateUser(false)} onClose={() => setShowCreateUser(false)} />
            )}

            {editingMember && (
                <EditMemberModal
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                    onSuccess={() => setEditingMember(null)}
                />
            )}
        </div>
    );
};

export default Administrator;