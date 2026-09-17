import { useEffect, useMemo, useRef, useState } from "react"
import "../styles/chatPage.css"
import {useVirtualizer} from "@tanstack/react-virtual"
import { useMessageQuery } from "../hooks/messageHook"
import { getUserId } from "../services/jwtdecode"
import toast from "react-hot-toast"
import { getConnection } from "../services/signalr"
import {  useChat } from "../contexts/chatContext"
import ChatHeader from "../components/chatHaader"
import { ArrowDown, Check, CheckCheck, Paperclip, SendHorizonal } from "lucide-react"
import Loader from "../components/loader"
import { useUploadAttachment } from "../hooks/messageHook"
import AttachmentPreviewChip from "../components/attachmentPreviewChip"
import MessageAttachment from "../components/messageAttachment"

export const handleReadMessages = async(selectedUserId: string) => {
    try{
        await getConnection().invoke("MarkAsRead", selectedUserId);
        console.log(`MArking this user's message as read ${selectedUserId}`)
    }
    catch(err){
        console.error("failed to read messages", err)
    }
}

const ChatPage = () => {
    const [text, setText] = useState<string>("");
    const [sending, setSending] = useState(false);
    const [showJumpButton, setShowJumpButton] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {selectedUser} = useChat();
    
    const uploadAttachment = useUploadAttachment();
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPendingFile(file);
        e.target.value = "";
    };

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
            await getConnection().invoke("SendDirectMessage", selectedUser?.userId, trimmed, attachmentId ?? null);
            setText("");
            setPendingFile(null);
        } catch (err) {
            console.error("Failed to send message:", err);
            toast.error(pendingFile ? `Failed to send attachment` : `Message failed to send`);
        } finally {
            setSending(false);
        }
    };
    
    const myId = getUserId();

    const query = useMessageQuery(selectedUser?.userId ?? "");
    const messages = useMemo(() => 
        query.data?.pages.flatMap(page => page?.messages).reverse() ?? []
    , [query.data]);
    const previousMessageCount = useRef(messages.length);

    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count:messages.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 53,
        getItemKey: (index) => messages[index]?.messageId ?? 0,
        overscan:5,
        anchorTo:"end",
        followOnAppend:true,
        scrollEndThreshold:70,
    })
    useEffect(() => {
        handleReadMessages(selectedUser?.userId ?? "");
    }, [selectedUser?.userId])

    useEffect(() => {
        const firstItem = virtualizer.getVirtualItems()[0];
        if(!firstItem)return;
        if(firstItem && query.hasNextPage && !query.isFetchingNextPage){
            query.fetchNextPage();
        }
    },[virtualizer.getVirtualItems()[0]?.index, query.hasNextPage, query.isFetchingNextPage]);

    useEffect(() => {
        if (messages.length > previousMessageCount.current) {
            if (!virtualizer.isAtEnd()) {
                setShowJumpButton(true);
            }
        }
            previousMessageCount.current = messages.length;
    }, [messages.length]);

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (!scrollEl) return;

        const handleScroll = () => {
            if (virtualizer.isAtEnd()) {
                setShowJumpButton(false);
            }
        };

        scrollEl.addEventListener("scroll", handleScroll);
        return () => scrollEl.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToLatest = () => {
        virtualizer.scrollToEnd();
        setShowJumpButton(false);
    };

    const formatMessageDate = (date: string) => {
        return new Date(date).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    if(query.isLoading) return <Loader/>;

    return(
        <div className="chat-page">
            <ChatHeader/>
            <div className="chat-container" ref={scrollRef}>
                {query.isFetchingNextPage && (
                    <div className="loading-older">Loading earlier messages…</div>
                )}
                <div style={{height:virtualizer.getTotalSize(), position:"relative", display:"flex"
                }}>
                    {query.isLoading && <Loader size="sm" fullHeight={false}/>}
                    {query.isError && <div><span>Something went wrong</span></div>}
                    {virtualizer.getVirtualItems().map(virtualItem => {
                        const message = messages[virtualItem.index];
                        const isMine = message?.senderId === myId; 
                        return(
                            <div className={`message-row ${isMine ? "mine" : "theirs"}`} 
                                ref={virtualizer.measureElement}
                                data-index={virtualItem.index}
                                key={message?.messageId} 
                                style={{
                                    position:"absolute",
                                    transform:`translateY(${virtualItem.start}px)`,
                                    width:"100%",
                                    top:0,
                                }}>
                                <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                                    {message?.content && <div className="message-content">{message?.content}</div>}
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
                        )
                    })}
                </div>
                {showJumpButton && (
                    <button className="jump-to-latest-btn" onClick={scrollToLatest}>
                        <ArrowDown size={14} /> New messages
                    </button>
                )}
            </div>
            <div className="chat-input">
                {/* NEW — shows the picked-but-not-yet-sent file above the input row */}
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
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} disabled={sending}>{<SendHorizonal/>}</button>
                </div>
            </div>
        </div>
    )
}

export default ChatPage
