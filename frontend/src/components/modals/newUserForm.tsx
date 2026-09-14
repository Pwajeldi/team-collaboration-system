import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import z from "zod"
import { useCreateMember } from "../../hooks/memberHook"
import { useFetchDepartments } from "../../hooks/departmentHook"
import type { CreateMemberDto } from "../../types/types"
import "../../styles/newUserForm.css"
import { useFetchRoles } from "../../hooks/loginHook"

type ShowUserFormProps = {
    onSuccess: () => void
    onClose: () => void
}

const NewUserForm = ({ onSuccess, onClose }: ShowUserFormProps) => {
    const createUser = useCreateMember();
    const rolesQuery = useFetchRoles();
    const departmentsQuery = useFetchDepartments();

    const userSchema = z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        email: z.email(),
        jobTitle: z.string(),
        department: z.number().int().positive(),
        role: z.string(),
        profilePicture: z.instanceof(File).refine((file) => file.size <= 1024 * 1024 * 5, "Image must be under 5MB")
            .refine((file) => file.type.startsWith("image/"), "File must be an image")
            .optional()
    })

    const form = useForm({
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            jobTitle: "",
            department: 0,
            role: "",
            profilePicture: undefined as File | undefined
        },
        validators: {
            onSubmit: userSchema as any, //revisit soon
        },
        onSubmit: ({ value }) => HandleSubmit(value)
    })

    const HandleSubmit = async (payload: CreateMemberDto) => {
        if (!payload) return;
        try {
            await createUser.mutateAsync(payload);
            onSuccess();
        }
        catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="new-user-overlay" onClick={onClose}>
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
                                        <option value="" disabled>
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
                                </>}
                        </form.Field>
                    </div>
                    <div className="new-user-group">
                        <label htmlFor="role">Role</label>
                        <form.Field name="role">
                            {(field) =>
                                <>
                                    <select
                                        id="role"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={rolesQuery.isLoading}
                                    >
                                        <option value="" disabled>
                                            {rolesQuery.isLoading ? "Loading roles…" : "Select a role"}
                                        </option>
                                        {rolesQuery.data?.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>}
                        </form.Field>
                    </div>
                    <div className="new-user-group new-user-group-full">
                        <label htmlFor="profilePicture">Profile Picture</label>
                        <form.Field name="profilePicture">
                            {(field) => (
                                <>
                                    <input
                                        id="profilePicture"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => field.handleChange(e.target.files?.[0])}
                                    />
                                    {field.state.value && (
                                        <img
                                            src={URL.createObjectURL(field.state.value)}
                                            alt="Preview"
                                            className="profile-preview"
                                        />
                                    )}
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>
                            )}
                        </form.Field>
                    </div>

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