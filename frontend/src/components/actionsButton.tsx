import { EllipsisVertical } from "lucide-react"
import "../styles/actionsButton.css"

type ActionButtonProps = {
    onClick:() => void
}


const ActionButton = ({onClick}: ActionButtonProps) => {
    return(
        <button className="action-btn" onClick={onClick} aria-label="More actions">
            {<EllipsisVertical/>}
        </button>
    )
}

export default ActionButton