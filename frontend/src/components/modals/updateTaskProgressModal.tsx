import { useUpdateTaskProgress } from "../../hooks/taskHook";
import type { UpdateTaskProgressPayload } from "../../types/types";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import "../../styles/updateTaskProgressModal.css"

type ProgressUpdateModalProps = {
    onClose: () => void,
    taskId: string,
    previousProgress: number
}

const schema = z.object({
    taskId: z.string(),
    progress: z.int().positive().min(0, "Cannot be lower than 0").max(100, "Progress cannot exceed 100"),
})

const ProgressupdateModal = ({onClose, taskId, previousProgress}: ProgressUpdateModalProps) => {
    const updateprogress = useUpdateTaskProgress();

    const form = useForm({
        defaultValues:{
            taskId: taskId,
            progress: previousProgress,
        },
        validators: {onSubmit: schema},
        onSubmit: async ({ value }) => {
            const payload:UpdateTaskProgressPayload = {
                ...value,
            };
            await updateprogress.mutateAsync(payload, {
                onSuccess:() => {
                    onClose();
                }
            });
        }
    })

    return(
        <div className="progress-update-overlay" onClick={(e)=>e.stopPropagation()}>
            <form className="progress-update-modal" onClick={(e)=>e.stopPropagation()} onSubmit={
                (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }
            }>
                <div className="task-progress-input">
                    <p>Update progress</p>
                    <form.Field name="progress">
                        {(field) => (
                            <>
                                <input
                                    id="task-progress"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <span className="field-error">{field.state.meta.errors[0]?.message}</span>
                                )}
                            </>
                        )}
                    </form.Field>
                </div>
                <div className="update-progress-actions">
                    <button type="button" className="cancel-progress" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" className="update-progress">
                        {updateprogress.isPending ? "Saving…" : "Save"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ProgressupdateModal