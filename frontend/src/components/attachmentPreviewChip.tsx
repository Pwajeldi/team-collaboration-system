import { FileText, X } from "lucide-react";
import "../styles/attachmentChip.css";

type AttachmentPreviewChipProps = {
    fileName: string;
    isUploading: boolean;
    onRemove: () => void;
};

const AttachmentPreviewChip = ({ fileName, isUploading, onRemove }: AttachmentPreviewChipProps) => (
    <div className="attachment-chip pending">
        <FileText size={14} />
        <span className="attachment-chip-name">{fileName}</span>
        {isUploading ? (
            <span className="attachment-chip-status">Uploading…</span>
        ) : (
            <button className="attachment-chip-remove" onClick={onRemove} aria-label="Remove attachment">
                <X size={12} />
            </button>
        )}
    </div>
);

export default AttachmentPreviewChip;