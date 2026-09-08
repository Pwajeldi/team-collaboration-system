import { FileText, Download, Trash2 } from "lucide-react";
import { useDownloadAttachment, useDeleteAttachment } from "../hooks/messageHook";
import type { Attachments } from "../types/types";
import "../styles/attachmentChip.css";

type MessageAttachmentProps = {
    attachment: Attachments;
    isMine: boolean;
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MessageAttachment = ({ attachment, isMine }: MessageAttachmentProps) => {
    const download = useDownloadAttachment();
    const deleteAttachment = useDeleteAttachment();

    const handleDownload = () => {
        download.mutate({ blobName: attachment.blobName, fileName: attachment.fileName });
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete "${attachment.fileName}"?`)) return;
        deleteAttachment.mutate(attachment.id);
    };

    return (
        <div className={`attachment-chip sent ${isMine ? "mine" : "theirs"}`}>
            <FileText size={16} />
            <div className="attachment-chip-info">
                <span className="attachment-chip-name">{attachment.fileName}</span>
                <span className="attachment-chip-size">{formatFileSize(attachment.fileSizeBytes)}</span>
            </div>
            <button
                className="attachment-chip-action"
                onClick={handleDownload}
                disabled={download.isPending}
                aria-label="Download"
            >
                <Download size={14} />
            </button>
            {isMine && (
                <button
                    className="attachment-chip-action danger"
                    onClick={handleDelete}
                    disabled={deleteAttachment.isPending}
                    aria-label="Delete"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

export default MessageAttachment;