import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { X } from "lucide-react";
import { useUpdateMember } from "../../hooks/adminhooks";
import { useFetchDepartments } from "../../hooks/departmentHook";
import { useFetchRoles } from "../../hooks/loginHook";
import type { getMemberResponse } from "../../types/types";
import "../styles/newUserForm.css";

type EditMemberModalProps = {
    member: getMemberResponse;
    onClose: () => void;
    onSuccess: () => void;
};

const editSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    jobTitle: z.string(),
    department: z.number().int().positive(),
    role: z.string(),
});

const EditMemberModal = ({ member, onClose, onSuccess }: EditMemberModalProps) => {
    const updateMember = useUpdateMember();
    const departmentsQuery = useFetchDepartments();
    const rolesQuery = useFetchRoles();

    const form = useForm({
        defaultValues: {
            firstName: member.firstName,
            lastName: member.lastName,
            jobTitle: member.jobTitle ?? "",
            department: member.departmentId,
            role: member.role,
        },
        validators: { onSubmit: editSchema },
        onSubmit: async ({ value }) => {
            await updateMember.mutateAsync({
                id: member.memberId,
                payload: {
                    firstName: value.firstName,
                    lastName: value.lastName,
                    jobTitle: value.jobTitle,
                    departmentId: value.department,
                    role: value.role,
                },
            });
            onSuccess();
        },
    });

    return (
        <div className="new-user-overlay" onClick={onClose}>
            <div className="new-user-container" onClick={(e) => e.stopPropagation()}>
                <div className="new-user-header">
                    <h3>Edit {member.firstName} {member.lastName}</h3>
                    <button className="new-user-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
                    <div className="new-user-group">
                        <label htmlFor="firstName">First Name</label>
                        <form.Field name="firstName">
                            {(field) => (
                                <>
                                    <input id="firstName" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>
                            )}
                        </form.Field>
                    </div>

                    <div className="new-user-group">
                        <label htmlFor="lastName">Last Name</label>
                        <form.Field name="lastName">
                            {(field) => (
                                <>
                                    <input id="lastName" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>
                            )}
                        </form.Field>
                    </div>

                    <div className="new-user-group">
                        <label htmlFor="jobTitle">Job Title</label>
                        <form.Field name="jobTitle">
                            {(field) => (
                                <input id="jobTitle" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                            )}
                        </form.Field>
                    </div>

                    <div className="new-user-group">
                        <label htmlFor="department">Department</label>
                        <form.Field name="department">
                            {(field) => (
                                <select
                                    id="department"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    disabled={departmentsQuery.isLoading}
                                >
                                    {departmentsQuery.data?.map((d) => (
                                        <option key={d.departmentId} value={d.departmentName}>{d.departmentName}</option>
                                    ))}
                                </select>
                            )}
                        </form.Field>
                    </div>

                    <div className="new-user-group">
                        <label htmlFor="role">Role</label>
                        <form.Field name="role">
                            {(field) => (
                                <select
                                    id="role"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={rolesQuery.isLoading}
                                >
                                    {rolesQuery.data?.map((r) => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            )}
                        </form.Field>
                    </div>

                    <div className="new-user-actions">
                        <button type="button" className="new-user-btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="new-user-btn" disabled={updateMember.isPending}>
                            {updateMember.isPending ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMemberModal;