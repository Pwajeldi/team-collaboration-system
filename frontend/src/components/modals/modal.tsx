import { X } from "lucide-react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal = ({isOpen, onClose, children}: ModalProps) => {
    if(!isOpen) return null;
    
    return(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose}><X size={24} color="red"/></button>
                {children}
            </div>
        </div>
    )
}

export default Modal;