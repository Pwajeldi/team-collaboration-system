import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDepartmentMessageQuery } from "../hooks/departmentHook";
import { getConnection } from "../services/signalr";
import { getUserId } from "../services/jwtdecode";
import "../styles/chatPage.css";
import Loader from "../components/loader";
import { Check, CheckCheck, Paperclip, SendHorizonal } from "lucide-react";
import { useUploadDepartmentAttachment } from "../hooks/messageHook";
import toast from "react-hot-toast";
import AttachmentPreviewChip from "../components/attachmentPreviewChip";
import MessageAttachment from "../components/messageAttachment";

const DepartmentChatPage = () => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const myId = getUserId();
    const department = sessionStorage.getItem("department");
    const uploadAttachment = useUploadDepartmentAttachment();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPendingFile(file);
        e.target.value = "";
    };

    const query = useDepartmentMessageQuery();
    const messages = query.data?.pages.flatMap(page => page?.messages).reverse() ?? [];

    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 53,
        getItemKey: (index) => messages[index]?.messageId ?? 0,
        overscan: 5,
        anchorTo: "end",
        followOnAppend: true,
        scrollEndThreshold: 70,
    });

    useEffect(() => {
        const firstItem = virtualizer.getVirtualItems()[0];
        if (!firstItem) return;
        if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
        }
    }, [virtualizer.getVirtualItems()[0]?.index, query.hasNextPage, query.isFetchingNextPage]);

    const formatMessageDate = (date: string) =>{
        return new Date(date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
        
    const handleSendMessage = async () => {
        const trimmed = text.trim();
        if ((!trimmed && !pendingFile) || sending) return;

        setSending(true);
        try {
            let attachmentId: number | undefined;
            if (pendingFile) {
                const uploaded = await uploadAttachment.mutateAsync(pendingFile);
                attachmentId = uploaded?.id;
            }
            await getConnection().invoke("SendDepartmentMessage", trimmed, attachmentId ?? null);
            setText("");
            setPendingFile(null);
        } catch (err) {
            console.error("Failed to send department message:", err);
            toast.error(pendingFile ? `Failed to send attachment` : `Message failed to send`);
        } finally {
            setSending(false);
        }
    };

    if (query.isLoading) return <Loader/>;

    return (
        <div className="chat-page">
            <div className="chat-header">
                <div className="chat-header-info">
                    <h2>{department}</h2>
                </div>
            </div>
            <div className="chat-container" ref={scrollRef}>
                {query.isFetchingNextPage && <div className="loading-older">Loading earlier messages…</div>}
                <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                    {query.isError && <div><span>Something went wrong</span></div>}
                    {virtualizer.getVirtualItems().map(virtualItem => {
                        const message = messages[virtualItem.index];
                        const isMine = message?.senderId === myId;
                        return (
                            <div
                                className={`message-row ${isMine ? "mine" : "theirs"}`}
                                ref={virtualizer.measureElement}
                                data-index={virtualItem.index}
                                key={message?.messageId}
                                style={{ position: "absolute", transform: `translateY(${virtualItem.start}px)`, width: "100%", top: 0 }}
                            >
                                <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                                    {!isMine && <div className="message-sender-name">{message?.senderName}</div>}
                                    <div className="message-content">{message?.content}</div>
                                    {message?.attachments?.map(attachment => (
                                        <MessageAttachment key={attachment.id} attachment={attachment} isMine={isMine} />
                                    ))}
                                    <span className="message-date">{formatMessageDate(message?.sentDate ?? "")}</span>
                                    {isMine && (
                                    <span className={`read-receipt ${message.isRead ? "read" : ""}`}>
                                        {message.isRead ? <CheckCheck size={14}/> : message.isDelivered ? <Check size={14}/> : ""}
                                    </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="chat-input">
                {pendingFile && (
                <AttachmentPreviewChip
                    fileName={pendingFile.name}
                    isUploading={sending && uploadAttachment.isPending}
                    onRemove={() => setPendingFile(null)}
                />
                )}
                <div className="chat-input-row">
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleFileSelect}
                    />
                    <button
                        className="chat-attach-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending}
                        aria-label="Attach file"
                        type="button"
                    >
                        <Paperclip size={18} />
                    </button>
                    <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button onClick={handleSendMessage} disabled={sending}>{<SendHorizonal size={20}/>}</button>
                </div>     
            </div>
        </div>
    );
};

export default DepartmentChatPage;