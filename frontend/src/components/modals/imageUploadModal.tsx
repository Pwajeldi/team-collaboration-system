import "../../styles/logoutModal.css";

type ImageUploadModalProps = {
    onClose: () => void;
    handleUploadImage: () => void;
    previewUrl: string;
}

const ImageUploadModal = ({onClose, handleUploadImage, previewUrl}: ImageUploadModalProps) => {
    return(
        <div className="logout-overlay" onClick={(e)=>e.stopPropagation()}>
            <div className="logout-modal" onClick={onClose}>
                <div className="profile-image-preview">
                    <img src={previewUrl} alt="Preview image"/>
                </div>
                <div className="logout-text">
                    <p>Change your profile picture?</p>
                </div>
                <div className="logout-button-container">
                    <button className="logout-cancel" onClick={onClose}>Cancel</button>
                    <button className="logout-confirm" onClick={handleUploadImage}>Upload</button>
                </div>
            </div>
        </div>
    )
}

export default ImageUploadModal