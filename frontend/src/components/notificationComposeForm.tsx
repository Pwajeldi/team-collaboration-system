// components/notificationComposeForm.tsx
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useRef, useState } from "react";
import { Info, TriangleAlert, Megaphone, CircleAlert, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useSendNotification } from "../hooks/notificationHook";
import { NotificationType, type NotificationTypeValue } from "../types/types";
import "../styles/notificationComposeForm.css";

const schema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Max 100 characters"),
    message: z.string().min(1, "Message is required").max(2000, "Max 2000 characters"),
    type: z.enum([NotificationType.Info, NotificationType.Warning, NotificationType.Announcement, NotificationType.Important]),
});

const typeOptions: { value: NotificationTypeValue; label: string; icon: typeof Info }[] = [
    { value: NotificationType.Info, label: "Info", icon: Info },
    { value: NotificationType.Warning, label: "Warning", icon: TriangleAlert },
    { value: NotificationType.Announcement, label: "Announcement", icon: Megaphone },
    { value: NotificationType.Important, label: "Important", icon: CircleAlert },
];

const NotificationComposeForm = () => {
    const sendNotification = useSendNotification();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachment, setAttachment] = useState<File | null>(null);

    const form = useForm({
        defaultValues: {
            title: "",
            message: "",
            type: NotificationType.Info as NotificationTypeValue,
        },
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            const formData = new FormData();
            formData.append("Title", value.title);
            formData.append("Message", value.message);
            formData.append("Type", value.type);
            if (attachment) formData.append("Attachment", attachment);

            await sendNotification.mutateAsync(formData, {
                onSuccess: () => toast.success("Notification sent to everyone."),
            });
            form.reset();
            setAttachment(null);
        },
    });

    return (
        <div className="notif-compose-card">
            <p className="notif-compose-title">Send New Notification</p>
            <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}>
                <div className="notif-form-group">
                    <label>Title</label>
                    <form.Field name="title">
                        {(field) => (
                            <>
                                <input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="A short, clear title" />
                                <div className="notif-field-footer">
                                    {field.state.meta.errors.length > 0 && <span className="field-error">{field.state.meta.errors[0]?.message}</span>}
                                    <span className="notif-char-count">{field.state.value.length}/100</span>
                                </div>
                            </>
                        )}
                    </form.Field>
                </div>

                <div className="notif-form-group">
                    <label>Message</label>
                    <form.Field name="message">
                        {(field) => (
                            <>
                                <textarea rows={6} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Write your message…" />
                                <div className="notif-field-footer">
                                    {field.state.meta.errors.length > 0 && <span className="field-error">{field.state.meta.errors[0]?.message}</span>}
                                    <span className="notif-char-count">{field.state.value.length}/2000</span>
                                </div>
                            </>
                        )}
                    </form.Field>
                </div>

                <div className="notif-form-group">
                    <label>Notification Type</label>
                    <form.Field name="type">
                        {(field) => (
                            <div className="notif-type-grid">
                                {typeOptions.map((opt) => {
                                    const Icon = opt.icon;
                                    return (
                                        <button
                                            type="button"
                                            key={opt.value}
                                            className={`notif-type-option ${field.state.value === opt.value ? "selected" : ""} type-${opt.value}`}
                                            onClick={() => field.handleChange(opt.value)}
                                        >
                                            <Icon size={16} />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </form.Field>
                </div>

                <div className="notif-form-group">
                    <label>Attachment (optional)</label>
                    <input ref={fileInputRef} type="file" hidden onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
                    <div className="notif-attach-dropzone" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={18} />
                        {attachment ? <span>{attachment.name}</span> : <span>Click to upload — PDF, DOC, DOCX, PNG, JPG (Max 5MB)</span>}
                    </div>
                </div>

                <div className="notif-compose-actions">
                    <button type="submit" className="notif-send-btn" disabled={sendNotification.isPending}>
                        {sendNotification.isPending ? "Sending…" : "Send Notification"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NotificationComposeForm;