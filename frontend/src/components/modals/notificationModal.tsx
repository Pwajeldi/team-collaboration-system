import "../../styles/notificationModal.css"
import type { NotificationResponseDto } from "../../types/types"

type NotificationModalProps = {
    onClose: () => void,
    showNotif: boolean,
    notification?: NotificationResponseDto
}

const NotificationModal = ({onClose, showNotif}: NotificationModalProps) => {
    return(
        <div className={`notif-overlay ${showNotif ? "show" : ""}`} onClick={onClose}>
            <div className={`notif-modal ${showNotif ? "open" : ""}`} onClick={(e)=>e.stopPropagation()}>

            </div>
        </div>
    )
}

export default NotificationModal