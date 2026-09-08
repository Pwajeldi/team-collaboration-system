import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as signalR from "@microsoft/signalr";
import { getConnection } from "../services/signalr";
import { getUserId } from "../services/jwtdecode";
import type {
    DepartmentMessageResponse,
    EventResponse,
    MessageResponse,
    PaginatedDepartmentMessageResponse,
    PaginatedMessageResponse,
} from "../types/types";
import MessageToast from "../components/toasts/messageToast";
import  EventToast  from "../components/toasts/eventToast"
import toast from "react-hot-toast";
import { useChat } from "../contexts/chatContext";
import { useNavigate } from "react-router";
import { handleReadMessages } from "../pages/chatPage";

export const useChatSocket = () => {
    const queryClient = useQueryClient();
    const myId = getUserId();
    const started = useRef(false);
    const navigate = useNavigate();
    const { selectedUser, setSelectedUser } = useChat();

    const handleReceive = (message: MessageResponse) => {
        console.log("received:", message);
        const isOwnEcho = message.senderId === myId;
        const conversationKey = isOwnEcho ? message.recipientId : message.senderId;
        queryClient.setQueryData(
            ["messages", conversationKey],
            (old: { pages: PaginatedMessageResponse[]; pageParam: (string | null)[] } | undefined) => {
                if (!old) return old;
                const pages = [...old.pages];
                const newestPage = {
                    ...pages[0],
                    messages: [message, ...pages[0].messages],
                };
                pages[0] = newestPage;
                return { ...old, pages };
            }
        );
        if (!isOwnEcho && message.senderId !== selectedUser?.userId) {
            toast.custom((t) => (
                <MessageToast
                    toastId={t.id}
                    senderName={message.senderName}
                    content={message.content}
                    onView={() => {
                        setSelectedUser({ userId: message.senderId, fullName: message.senderName });
                        navigate("/chat");
                    }}
                />
            ));
        }

        if (message.senderId === selectedUser?.userId) {
        handleReadMessages(selectedUser?.userId);
        console.log(`Handling read message: ${selectedUser?.fullName}`)
    }
    };

    const handleReceiveDepartmentMessage = (message: DepartmentMessageResponse) => {
        queryClient.setQueryData(
            ["department-messages"],
            (old: { pages: PaginatedDepartmentMessageResponse[]; pageParams: (string | undefined)[] } | undefined) => {
                if (!old) return old;
                const pages = [...old.pages];
                pages[0] = {
                    ...pages[0],
                    messages: [message, ...pages[0].messages],
                };
                return { ...old, pages };
            }
        );

        if (message.senderId !== myId) {
            toast.custom((t) => (
                <MessageToast
                    toastId={t.id}
                    senderName={`${message.senderName} (Team)`}
                    content={message.content}
                    onView={() => navigate("/departmentchat")}
                />
            ));
        }
    };

    const handleNewEvent = (event: EventResponse) => {
        queryClient.invalidateQueries({queryKey:["events"]});
         toast.custom((t) => (
            <EventToast
                toastId={t.id}
                title={event.title}
                start={event.start}
                onView={() => navigate("/calendar")}
            />
        ));
    }

    const handleMessagesRead = (messageIds: number[]) => {
        const idSet = new Set(messageIds);
        queryClient.setQueriesData(
            {queryKey: ["messages"]},
            (old: {pages: PaginatedMessageResponse[]}|undefined) => {
                if(!old) return old;
                return{
                    ...old,
                    pages: old.pages.map(page => ({
                        ...page,
                        messages: page.messages.map(message => 
                            idSet.has(message.messageId) ? {...message, isRead:true } : message)
                    }))
                };
            }
        )
        
    };

    const clearUnreadBadge = () => {
        queryClient.invalidateQueries({queryKey:["userList"]});
    }

    useEffect(() => {
        const connection = getConnection();

        connection.on("ReceiveDepartmentMessage", handleReceiveDepartmentMessage);
        connection.on("ReceiveMessage", handleReceive);
        connection.on("InvitedToEvent", handleNewEvent);
        connection.on("MessagesRead", handleMessagesRead);
        connection.on("ClearUnreadBadge", clearUnreadBadge)

        if (connection.state === signalR.HubConnectionState.Disconnected && !started.current) {
            started.current = true;
            connection.start().catch(err => console.error("SignalR connection failed:", err));
        };

        return () => {
            connection.off("ReceiveMessage", handleReceive);
            connection.off("ReceiveDepartmentMessage", handleReceiveDepartmentMessage);
            connection.off("InvitedToEvent", handleNewEvent);
            connection.off("MessagesRead", handleMessagesRead);
            connection.off("ClearUnreadBadge", clearUnreadBadge);
        };
    }, [selectedUser?.userId]);
};