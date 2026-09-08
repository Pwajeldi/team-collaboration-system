import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useDepartmentMessageQuery } from "../hooks/departmentHook";
import { getConnection } from "../services/signalr";
import { getUserId } from "../services/jwtdecode";
import "../styles/chatPage.css";
import Loader from "../components/loader";
import { SendHorizonal } from "lucide-react";

const DepartmentChatPage = () => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const myId = getUserId();
    const department = sessionStorage.getItem("department");

    const query = useDepartmentMessageQuery();
    const messages = query.data?.pages.flatMap(page => page.messages).reverse() ?? [];

    const scrollRef = useRef<HTMLDivElement>(null);
    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => 53,
        getItemKey: (index) => messages[index]?.messageId,
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

    const formatMessageDate = (date: string) =>
        new Date(date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    const handleSendMessage = async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setSending(true);
        try {
            await getConnection().invoke("SendDepartmentMessage", trimmed);
            setText("");
        } catch (err) {
            console.error("Failed to send department message:", err);
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
                        const isMine = message.senderId === myId;
                        return (
                            <div
                                className={`message-row ${isMine ? "mine" : "theirs"}`}
                                ref={virtualizer.measureElement}
                                data-index={virtualItem.index}
                                key={message.messageId}
                                style={{ position: "absolute", transform: `translateY(${virtualItem.start}px)`, width: "100%", top: 0 }}
                            >
                                <div className={`message-bubble ${isMine ? "mine" : "theirs"}`}>
                                    {!isMine && <div className="message-sender-name">{message.senderName}</div>}
                                    <div className="message-content">{message.content}</div>
                                    <span className="message-date">{formatMessageDate(message.sentDate)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="chat-input">
                <div className="chat-input-row">
                    <input
                    type="text"
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