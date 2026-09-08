import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";
import type { StatusId } from "../components/taskBoard";

type DroppableProps = {
    id: StatusId
    children: ReactNode
}

export const Droppable = ({id, children}: DroppableProps) => {
    const drop = useDroppable({
        id: id
    })

    return(
        <div ref={drop.ref}>
            {children}
        </div>
    )
}