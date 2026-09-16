import { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { X, Search } from "lucide-react";
import {  useUpdateEvent } from "../../hooks/calendarHook";
import "../../styles/eventFormModal.css";
import { useGetUsers } from "../../hooks/memberHook";
import type { EventResponse, UpdateEventDto } from "../../types/types";
import toast from "react-hot-toast";

type EventFormModalProps = {
    event: EventResponse,
    onClose: () => void;
};

const updateEventSchema = z.object({
    eventId: z.string(),
    userIds: z.array(z.string()),
    eventDescription: z.string(),
    start: z.string().min(1, "Start time is required"),
    end: z.string().min(1, "End time is required"),
    location: z.string(),
    title: z.string(),
    isMeeting: z.boolean(),
    })
    .refine((data) => new Date(data.end) > new Date(data.start), {
    message: "End time must be after start time",
    path: ["end"],
});

// yyyy-MM-ddTHH:mm — what <input type="datetime-local"> requires
const toLocalInputValue = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const UpdateEventModal = ({ event, onClose}: EventFormModalProps) => {
    const usersQuery = useGetUsers();
    const updateEvent = useUpdateEvent();
    const [attendeeSearch, setAttendeeSearch] = useState("");

    console.log("Event:", event);
    console.log("Attendees:", event.attendees);
    console.log(
    "Mapped user IDs:",
    event.attendees.map(a => a.userId)
    );

    const form = useForm({
        defaultValues: {
            eventId: event.id,
            eventDescription: event.description ?? "",
            start: toLocalInputValue(event.start),
            end: toLocalInputValue(event.end),
            userIds: event.attendees.map(a => a.userId) as string[],
            location: event.location ?? "",
            title:  event.title ?? "",
            isMeeting: event.isMeeting,
        },
        validators: { onSubmit: updateEventSchema },
        onSubmitInvalid: ({formApi}) => {
            console.log("Form is invalid");
            console.log(formApi.state.errorMap)
        },
        onSubmit: async ({ value }) => {
            console.log("Handling event update...")
            const payload: UpdateEventDto = {
                eventId: value.eventId,
                eventDescription: value.eventDescription?.trim(),
                userIds: value.userIds,
                start: new Date(value.start).toISOString(),
                end: new Date(value.end).toISOString(),
                location: value.location,
                title: value.title,
                isMeeting: value.isMeeting,
            };
            const updated = await updateEvent.mutateAsync(payload, {
                onSuccess:() => {onClose()}
            });
            const conflicted = updated.attendees.filter((a) => a.hadOverlapAtCreation);
            if (conflicted.length > 0) {
                toast(
                    `Heads up: ${conflicted.map((a) => a.fullName).join(", ")} ${conflicted.length === 1 ? "has" : "have"} a scheduling conflict.`,
                    { icon: "⚠️" }
                );
            }
        },
    });



    const filteredAttendees = useMemo(() => {
        const list = usersQuery.data ?? [];
        if (!attendeeSearch.trim()) return list;
        const search = attendeeSearch.toLowerCase();
        return list.filter((u) => u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
    }, [usersQuery.data, attendeeSearch]);

    if(updateEvent.isSuccess){
        onClose();
    }

    return (
        <div className="event-modal-overlay" onClick={onClose}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                <div className="event-modal-header">
                    <h3>Update Event</h3>
                    <button className="event-modal-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={(e) => { 
                    e.preventDefault();
                    e.stopPropagation(); 
                    form.handleSubmit(); 
                    }}
                    >
                    <div className="event-form-group">
                        <label htmlFor="title">Title</label>
                        <form.Field name="title">
                            {(field) => (
                                <>
                                    <input
                                        id="title"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="e.g. Sprint Planning"
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <span className="field-error">{field.state.meta.errors?.map((error, index) => (<p key={index}>{error?.message}</p>))}</span>
                                    )}
                                </>
                            )}
                        </form.Field>
                    </div>

                    <div className="event-form-group">
                        <label htmlFor="eventDescription">Description</label>
                        <form.Field name="eventDescription">
                            {(field) => (
                                <textarea
                                    id="eventDescription"
                                    rows={3}
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="What's this meeting about?"
                                />
                            )}
                        </form.Field>
                    </div>

                    <div className="event-form-group">
                        <label htmlFor="location">Location</label>
                        <form.Field name="location">
                            {(field) => (
                                <input
                                    id="location"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. Conference Room A, or a video call link"
                                />
                            )}
                        </form.Field>
                    </div>

                    <div className="event-form-row">
                        <div className="event-form-group">
                            <label htmlFor="start">Start</label>
                            <form.Field name="start">
                                {(field) => (
                                    <>
                                        <input
                                            id="start"
                                            type="datetime-local"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <span className="field-error">{field.state.meta.errors?.map((error, index) => (<p key={index}>{error?.message}</p>))}</span>
                                        )}
                                    </>
                                )}
                            </form.Field>
                        </div>

                        <div className="event-form-group">
                            <label htmlFor="end">End</label>
                            <form.Field name="end">
                                {(field) => (
                                    <>
                                        <input
                                            id="end"
                                            type="datetime-local"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <span className="field-error">{field.state.meta.errors?.map((error, index) => (<p key={index}>{error?.message}</p>))}</span>
                                        )}
                                    </>
                                )}
                            </form.Field>
                        </div>
                    </div>

                     <div className="event-form-group">
                        <label className="event-checkbox-label">
                            <form.Field name="isMeeting">
                                {(field) => (
                                    <input
                                        type="checkbox"
                                        checked={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.checked)}
                                    />
                                )}
                            </form.Field>
                            Make this a video meeting
                        </label>
                    </div>

                    <div className="event-form-group">
                        <label>Attendees</label>
                        <form.Field name="userIds">
                            {(field) => {
                                const selectedUsers = (usersQuery.data ?? []).filter((u) =>
                                    field.state.value.includes(u.userId)
                                );

                                const toggle = (userId: string) => {
                                    field.handleChange(
                                        field.state.value.includes(userId)
                                            ? field.state.value.filter((id) => id !== userId)
                                            : [...field.state.value, userId]
                                    );
                                };

                                return (
                                    <>
                                        {selectedUsers.length > 0 && (
                                            <div className="attendee-chips">
                                                {selectedUsers.map((u) => (
                                                    <span key={u.userId} className="attendee-chip">
                                                        {u.fullName}
                                                        <button type="button" onClick={() => toggle(u.userId)} aria-label={`Remove ${u.fullName}`}>
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="attendee-search">
                                            <Search size={14} />
                                            <input
                                                placeholder="Search people…"
                                                value={attendeeSearch}
                                                onChange={(e) => setAttendeeSearch(e.target.value)}
                                            />
                                        </div>

                                        <div className="attendee-list">
                                            {usersQuery.isLoading && <p className="attendee-empty">Loading…</p>}
                                            {!usersQuery.isLoading && filteredAttendees.length === 0 && (
                                                <p className="attendee-empty">No matches.</p>
                                            )}
                                            {filteredAttendees.map((u) => (
                                                <label key={u.userId} className="attendee-row">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.state.value.includes(u.userId)}
                                                        onChange={() => toggle(u.userId)}
                                                    />
                                                    <div>
                                                        <div className="attendee-name">{u.fullName}</div>
                                                        <div className="attendee-email">{u.email}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                );
                            }}
                        </form.Field>
                    </div>

                    <div className="event-modal-actions">
                        <button type="button" className="event-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="event-btn-primary" disabled={updateEvent.isPending}>
                            {updateEvent.isPending ? "Updating..." : "Update Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateEventModal;