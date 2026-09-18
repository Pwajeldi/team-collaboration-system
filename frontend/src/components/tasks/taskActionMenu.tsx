import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import ActionButton from "../actionsButton";
import { type TaskResponse, type TaskStatusType } from "../../types/types";
import "../../styles/taskActionsMenu.css";
import ProgressupdateModal from "../modals/updateTaskProgressModal";

type TaskActionsMenuProps = {
    task: TaskResponse;
    actions: { label: string; status: TaskStatusType }[];
    isManagerOrAdmin: boolean;
    onChangeStatus: (task: TaskResponse, status: TaskStatusType) => void;
    onEdit: (task: TaskResponse) => void;
    onDelete: (task: TaskResponse) => void;
};

const TaskActionsMenu = ({ task, actions, isManagerOrAdmin, onChangeStatus, onEdit, onDelete }: TaskActionsMenuProps) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [openProgressModal, setOpenProgressModal] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openMenu = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) {
            setPosition({ top: rect.bottom + 6, left: rect.right - 180 });
        }
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };

        const handleScroll = () => setOpen(false);

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [open]);

    if (actions.length === 0 && !isManagerOrAdmin) return null;

    return (
        <div className="task-actions-menu" ref={triggerRef}>
            <ActionButton onClick={() => (open ? setOpen(false) : openMenu())} />
            {open && (
                <div
                    className="task-actions-dropdown"
                    ref={dropdownRef}
                    style={{ top: position.top, left: position.left }}
                >
                    {actions.map((action) => (
                        <button
                            key={action.status}
                            className="task-actions-dropdown-item"
                            onClick={() => { onChangeStatus(task, action.status); setOpen(false); }}
                        >
                            {action.label}
                        </button>
                    ))}

                    <button
                        className="task-actions-dropdown-item"
                        onClick={() => { setOpenProgressModal(true); setOpen(false); }}
                    >
                        Update progress
                    </button>

                    {isManagerOrAdmin && (
                        <>
                            <div className="task-actions-divider" />
                            <button className="task-actions-dropdown-item" onClick={() => { onEdit(task); setOpen(false); }}>
                                <Pencil size={14} /> Edit
                            </button>
                            <button className="task-actions-dropdown-item danger" onClick={() => { onDelete(task); setOpen(false); }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </>
                    )}
                </div>
            )}

            {openProgressModal && (
                <ProgressupdateModal
                    onClose={() => setOpenProgressModal(false)}
                    taskId={task.id}
                    previousProgress={task.progress}
                />
            )}
        </div>
    );
};

export default TaskActionsMenu;