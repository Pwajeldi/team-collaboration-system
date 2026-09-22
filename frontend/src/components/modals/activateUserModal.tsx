import "../../styles/logoutModal.css"

type DeleteUserProps = {
    onClose: () => void,
    handleActivate: () => void,
    userName: string,
}

const ActivateUserModal = ({onClose, handleActivate, userName}: DeleteUserProps) => {
    return(
        <div className="logout-overlay">
            <div className="logout-modal">
                <div className="logout-text">
                    <p>Activate {`${userName}`}</p>
                </div>
                <div className="logout-button-container">
                    <button className="logout-cancel" onClick={onClose}>Cancel</button>
                    <button className="activate-confirm" onClick={handleActivate}>Activate</button>
                </div>
            </div>
        </div>
    )
}

export default ActivateUserModal