import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import z from "zod"
import { useCreateMember } from "../../hooks/memberHook"
import { useFetchDepartments } from "../../hooks/departmentHook"
import type { CreateMemberDto } from "../../types/types"
import "../../styles/newUserForm.css"
import { useFetchRoles } from "../../hooks/loginHook"
import Loader from "../loader"
import { PRIMARY_ROLES } from "./editMemberModal"

type ShowUserFormProps = {
    onSuccess: () => void
    onClose: () => void
}

const NewUserForm = ({ onSuccess, onClose }: ShowUserFormProps) => {
    const createUser = useCreateMember();
    const rolesQuery = useFetchRoles();
    const departmentsQuery = useFetchDepartments();

    const userSchema = z.object({
        firstName: z.string().min(2, "Required field"),
        lastName: z.string().min(2, "Required field"),
        email: z.email("Required field"),
        jobTitle: z.string("Required field"),
        department: z.int().positive("Select a department"),
        primaryRole: z.enum(PRIMARY_ROLES),
        secondaryRoles: z.array(z.string()),
    })

    const secondaryRoleOptions = (rolesQuery.data ?? []).filter(
        (r) => !PRIMARY_ROLES.includes(r.name.toLowerCase() as any)
    );

    const initialSecondaryRoles: string[] = [];

    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            jobTitle: "",
            department: 0,
            primaryRole: "",
            secondaryRoles: initialSecondaryRoles,
        },
        validators: {
            onSubmit: userSchema as any, //revisit soon
        },
        onSubmit: ({ value }) => HandleSubmit(value)
    })

    const HandleSubmit = async (payload: CreateMemberDto) => {
        if (!payload) return;
        await createUser.mutateAsync(payload,{
            onSuccess() {
                onSuccess();
            },
        });
    }

    return (
        <div className="new-user-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="new-user-container" onClick={(e) => e.stopPropagation()}>
                <div className="new-user-header">
                    <h3>Create User</h3>
                    <button className="new-user-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}>
                    <div className="new-user-group">
                        <label htmlFor="firstName">First Name</label>
                        <form.Field name="firstName">
                            {(field) => <>
                                <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                                    id="firstName"
                                    type="text"
                                    placeholder="e.g Peter"
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                )}
                            </>
                            }
                        </form.Field>
                    </div>
                    <div className="new-user-group">
                        <label htmlFor="lastName">Last Name</label>
                        <form.Field name="lastName">
                            {(field) =>
                                <>
                                    <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                                        id="lastName"
                                        type="text"
                                        placeholder="e.g Simon"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>}
                        </form.Field>
                    </div>
                    <div className="new-user-group">
                        <label htmlFor="email">Email</label>
                        <form.Field name="email">
                            {(field) =>
                                <>
                                    <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>}
                        </form.Field>
                    </div>
                    <div className="new-user-group">
                        <label htmlFor="jobTitle">Job Title</label>
                        <form.Field name="jobTitle">
                            {(field) =>
                                <>
                                    <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                                        id="jobTitle"
                                        type="text"
                                        placeholder="e.g. Developer"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>}
                        </form.Field>
                    </div>
                    <div className="new-user-group">
                        <label htmlFor="department">Department</label>
                        <form.Field name="department">
                            {(field) =>
                                <>
                                    <select
                                        id="department"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(Number(e.target.value))}
                                        disabled={departmentsQuery.isLoading}
                                    >
                                        <option value={0} >
                                            {departmentsQuery.isLoading ? <Loader size="sm" fullHeight={false}/> : "Select a department"}
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
                                </>}
                        </form.Field>
                    </div>
                    <div className="new-user-group">
                        
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
                        <button type="button" className="new-user-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="new-user-btn" type="submit" disabled={createUser.isPending}>
                            {createUser.isPending ? "Creating…" : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NewUserForm