import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { X } from "lucide-react";
import { useUpdateMember, useAssignRole, useRemoveRole } from "../../hooks/adminhooks";
import { useFetchDepartments } from "../../hooks/departmentHook";
import { useFetchRoles } from "../../hooks/loginHook";
import type { getMemberResponse } from "../../types/types";
import "../../styles/newUserForm.css";
import toast from "react-hot-toast";

type EditMemberModalProps = {
    member: getMemberResponse;
    onClose: () => void;
    onSuccess: () => void;
};

export const PRIMARY_ROLES = ["admin", "manager", "regular"] as const;

const editSchema = z.object({
    firstName: z.string().min(2, "Required field"),
    lastName: z.string().min(2, "Required field"),
    jobTitle: z.string(),
    department: z.number().int().positive("Select department"),
    primaryRole: z.enum(PRIMARY_ROLES),
    secondaryRoles: z.array(z.string()),
});

const EditMemberModal = ({ member, onClose, onSuccess }: EditMemberModalProps) => {
    const updateMember = useUpdateMember();
    const assignRole = useAssignRole();
    const removeRole = useRemoveRole();
    const departmentsQuery = useFetchDepartments();
    const rolesQuery = useFetchRoles();

    const secondaryRoleOptions = (rolesQuery.data ?? []).filter(
        (r) => !PRIMARY_ROLES.includes(r.name.toLowerCase() as any)
    );

    const initialSecondaryRoles: string[] = member.secondaryRoles; // TODO: seed from member's actual secondary roles if available

    const form = useForm({
        defaultValues: {
            firstName: member.firstName,
            lastName: member.lastName,
            jobTitle: member.jobTitle ?? "",
            department: member.departmentId,
            primaryRole: member.primaryRole as (typeof PRIMARY_ROLES)[number],
            secondaryRoles: initialSecondaryRoles,
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
                    primaryRole: value.primaryRole,
                    secondaryRoles: value.secondaryRoles,
                },
            }, {
                onSuccess: () => {toast.success("User has been updated"); onClose()},
                onError: () => {toast.error("Failed to complete this action"); onClose()},
            });

            // 2. diff secondary roles against what the member started with,
            // and fire the assign/remove endpoints only for what actually changed
           // const toAdd = value.secondaryRoles.filter((r) => !initialSecondaryRoles.includes(r));
            //const toRemove = initialSecondaryRoles.filter((r) => !value.secondaryRoles.includes(r));

            //await Promise.all([
              //  ...toAdd.map((role) => assignRole.mutateAsync({ userId: member.memberId, role })),
                //...toRemove.map((role) => removeRole.mutateAsync({ userId: member.memberId, role })),
            //]);

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
                                <>
                                    <select
                                        id="department"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        disabled={departmentsQuery.isLoading}
                                    >
                                        <option value="">
                                            {departmentsQuery.isLoading ? "Loading departments…" : "Select a department"}
                                        </option>
                                        {departmentsQuery.data?.map((dept) => (
                                            <option key={dept.departmentId} value={dept.departmentId}>
                                                {dept.departmentName}
                                            </option>
                                        ))}
                                    </select>
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>
                            )}
                        </form.Field>
                    </div>

                    <div className="new-user-group">
                        <label>Primary Role</label>
                        <form.Field name="primaryRole">
                            {(field) => (
                                <div className="role-radio-group">
                                    {PRIMARY_ROLES.map((role) => (
                                        <label key={role} className="role-radio-option">
                                            <input
                                                type="radio"
                                                name="primaryRole"
                                                value={role}
                                                checked={field.state.value === role}
                                                onChange={() => field.handleChange(role)}
                                            />
                                            <span className="role-radio-label">{role}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {secondaryRoleOptions.length > 0 && (
                        <div className="new-user-group">
                            <label>Secondary Roles</label>
                            <form.Field name="secondaryRoles">
                                {(field) => (
                                    <div className="role-checkbox-group">
                                        {secondaryRoleOptions.map((r) => {
                                            const roleValue = r.name.toLowerCase();
                                            const checked = field.state.value.includes(roleValue);
                                            return (
                                                <label key={r.id} className="role-checkbox-option">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {
                                                            field.handleChange(
                                                                checked
                                                                    ? field.state.value.filter((v) => v !== roleValue)
                                                                    : [...field.state.value, roleValue]
                                                            );
                                                        }}
                                                    />
                                                    <span className="role-checkbox-label">{r.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </form.Field>
                        </div>
                    )}

                    <div className="new-user-actions">
                        <button type="button" className="new-user-btn-secondary" onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="new-user-btn"
                            disabled={updateMember.isPending || assignRole.isPending || removeRole.isPending}
                        >
                            {updateMember.isPending || assignRole.isPending || removeRole.isPending ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMemberModal;