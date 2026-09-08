import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { X } from "lucide-react";
import { TaskPriority, type TaskResponse } from "../types/types";
import { useCreateTask, useUpdateTask, useGetAssignableMembers } from "../hooks/taskHook";
import "../styles/taskFormModal.css";

type TaskFormModalProps = {
    task?: TaskResponse;
    onClose: () => void;
    onSuccess: () => void;
};

const taskSchema = z.object({
    title: z.string().min(2, "Title is too short"),
    description: z.string(),
    assigneeId: z.string().min(1, "Select someone to assign this to"),
    priority: z.enum([TaskPriority.Low, TaskPriority.Medium, TaskPriority.High]),
    dueDate: z.string(),
    progress: z.number().min(0).max(100),
});

const TaskFormModal = ({ task, onClose, onSuccess }: TaskFormModalProps) => {
    const isEditMode = !!task;
    const membersQuery = useGetAssignableMembers();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();

    const isSubmitting = createTask.isPending || updateTask.isPending;

    const form = useForm({
        defaultValues: {
            title: task?.title ?? "",
            description: task?.description ?? undefined,
            assigneeId: task?.assignedToId ?? "",
            priority: task?.priority ?? TaskPriority.Medium,
            dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : undefined, // ISO -> yyyy-mm-dd for the date input
            progress: task?.progress ?? 0,
        },
        validators: { onSubmit: taskSchema },
        onSubmit: async ({ value }) => {
            const payload = {
                ...value,
                dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : undefined,
            };

            if (isEditMode) {
                await updateTask.mutateAsync({ id: task.id, payload });
            } else {
                await createTask.mutateAsync(payload);
            }
            onSuccess();
        },
    });

    return (
        <div className="task-modal-overlay" onClick={onClose}>
            <div className="task-modal" onClick={(e) => e.stopPropagation()}>
                <div className="task-modal-header">
                    <h3>{isEditMode ? "Edit Task" : "Assign Task"}</h3>
                    <button className="task-modal-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <div className="task-form-group">
                        <label htmlFor="title">Task Title</label>
                        <form.Field name="title">
                            {(field) => (
                                <>
                                    <input
                                        id="title"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. Update employee API"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                    )}
                                </>
                            )}
                        </form.Field>
                    </div>

                    <div className="task-form-group">
                        <label htmlFor="description">Description</label>
                        <form.Field name="description">
                            {(field) => (
                                <textarea
                                    id="description"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="Describe the task in detail…"
                                    rows={3}
                                />
                            )}
                        </form.Field>
                    </div>

                    <div className="task-form-row">
                        <div className="task-form-group">
                            <label htmlFor="assigneeId">Assign To</label>
                            <form.Field name="assigneeId">
                                {(field) => (
                                    <>
                                        <select
                                            id="assigneeId"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            disabled={membersQuery.isLoading}
                                        >
                                            <option value="" disabled>
                                                {membersQuery.isLoading ? "Loading…" : "Select assignee"}
                                            </option>
                                            {membersQuery.data?.map((m) => (
                                                <option key={m.userId} value={m.userId}>
                                                    {m.fullName}
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

                        <div className="task-form-group">
                            <label htmlFor="priority">Priority</label>
                            <form.Field name="priority">
                                {(field) => (
                                    <select
                                        id="priority"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value as typeof field.state.value)}
                                    >
                                        <option value={TaskPriority.Low}>Low</option>
                                        <option value={TaskPriority.Medium}>Medium</option>
                                        <option value={TaskPriority.High}>High</option>
                                    </select>
                                )}
                            </form.Field>
                        </div>
                    </div>

                    <div className="task-form-group">
                        <label htmlFor="progress">Progress</label>
                        <form.Field name="progress">
                            {(field) => (
                                <input id="progress"
                                type="number"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(Number(e.target.value))}/>
                            )}
                        </form.Field>
                    </div>

                    <div className="task-form-group">
                        <label htmlFor="dueDate">Due Date</label>
                        <form.Field name="dueDate">
                            {(field) => (
                                <>
                                <input
                                    id="dueDate"
                                    type="date"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                )}
                                </>
                            )}
                        </form.Field>
                    </div>

                    <div className="task-modal-actions">
                        <button type="button" className="task-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="task-btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Saving…" : isEditMode ? "Save Changes" : "Assign Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskFormModal;