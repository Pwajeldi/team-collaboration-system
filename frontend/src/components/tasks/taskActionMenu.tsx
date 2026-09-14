import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2 } from "lucide-react";
import ActionButton from "../actionsButton";
import { type TaskResponse, type TaskStatusType } from "../../types/types";
import "../../styles/taskActionsMenu.css";

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
    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openMenu = () => {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) {
            setPosition({ top: rect.bottom + 6, left: rect.right - 100 });
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

        // NEW — a portal-rendered dropdown won't move with the table on
        // scroll, so close it rather than let it drift out of alignment
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
            {/* CHANGED — toggling now goes through openMenu() so position is
                computed fresh each time it opens, not just flipped blindly */}
            <ActionButton onClick={() => (open ? setOpen(false) : openMenu())} />
            {/* CHANGED — dropdown now rendered via createPortal into document.body,
                with fixed positioning, instead of a normal nested absolute div */}
            {open && createPortal(
                <div
                    className="task-actions-dropdown"
                    ref={dropdownRef}
                    style={{ position: "fixed", top: position.top, left: position.left }}
                >
                    {actions.map((action) => {
                        return (
                        <button
                            key={action.status}
                            className="task-actions-dropdown-item"
                            onClick={() => { onChangeStatus(task, action.status); setOpen(false); }}
                        >
                            {action.label}
                        </button>
                    )})}
                    {isManagerOrAdmin && (
                        <>
                            {actions.length > 0 && <div className="task-actions-divider" />}
                            <button className="task-actions-dropdown-item" onClick={() => { onEdit(task); setOpen(false); }}>
                                <Pencil size={14} /> Edit
                            </button>
                            <button className="task-actions-dropdown-item danger" onClick={() => { onDelete(task); setOpen(false); }}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};

export default TaskActionsMenu;