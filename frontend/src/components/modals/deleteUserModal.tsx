import "../../styles/logoutModal.css"

type DeleteUserProps = {
    onClose: () => void,
    handleDelete: () => void,
    userName: string,
}

const DeleteUserModal = ({onClose, handleDelete, userName}: DeleteUserProps) => {
    return(
        <div className="logout-overlay">
            <div className="logout-modal">
                <div className="logout-text">
                    <p>Removing {`${userName}`} from system</p>
                </div>
                <div className="logout-button-container">
                    <button className="logout-cancel" onClick={onClose}>Cancel</button>
                    <button className="logout-confirm" onClick={handleDelete}>Remove</button>
                </div>
            </div>
        </div>
    )
}

export default DeleteUserModal