import "../../styles/logoutModal.css"
type LogoutModalProps = {
    onClose: () => void,
    handleLogout: () => void,
}
const LogoutModal = ({onClose, handleLogout}: LogoutModalProps) => {
    return(
        <div className="logout-overlay">
            <div className="logout-modal">
                <div className="logout-text">
                    <p>Are you sure you want to log out?</p>
                </div>
                <div className="logout-button-container">
                    <button className="logout-cancel" onClick={onClose}>Cancel</button>
                    <button className="logout-confirm" onClick={handleLogout}>Log out</button>
                </div>
            </div>
        </div>
    )
}

export default LogoutModal