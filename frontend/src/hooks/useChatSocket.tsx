import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as signalR from "@microsoft/signalr";
import { getConnection } from "../services/signalr";
import { getUserId } from "../services/jwtdecode";
import type {
    DepartmentMessageResponse,
    EventResponse,
    MessageResponse,
    NotificationResponseDto,
    PaginatedDepartmentMessageResponse,
    PaginatedMessageResponse,
} from "../types/types";
import MessageToast from "../components/toasts/messageToast";
import  EventToast  from "../components/toasts/eventToast"
import toast from "react-hot-toast";
import { useChat } from "../contexts/chatContext";
import { useNavigate } from "react-router";
import { handleReadMessages } from "../pages/chatPage";
import NotificationToast from "../components/toasts/notificationToast";

export const useChatSocket = () => {
    const queryClient = useQueryClient();
    const myId = getUserId();
    const started = useRef(false);
    const navigate = useNavigate();
    const { selectedUser, setSelectedUser } = useChat();

    const handleReceive = (message: MessageResponse) => {
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
                        setSelectedUser({ userId: message.senderId ?? "", fullName: message.senderName, profilePictureUrl:null}); //I will revisit you soon
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

    const handleUserOnline = (userId: string) => {
        queryClient.setQueryData<string[]>(["online-users"], (old = []) => {
            return old?.includes(userId) ? old : [...old, userId];
        })
    }

    const handleUserOffline = (userId: string) => {
        queryClient.setQueryData<string[]>(["online-users"], (old = []) => {
            return old.includes(userId) ? old.filter(id => id !== userId) : old;
        });
    }

    const clearUnreadBadge = () => {
        queryClient.invalidateQueries({queryKey:["userList"]});
    }

    const handleReceiveNotification = (notification: NotificationResponseDto) => {
        queryClient.setQueryData<NotificationResponseDto[]>(["notifications"], (old = []) => [notification, ...old]);
        toast.custom((t) => (
            <NotificationToast
            toastId={t.id}
            title={notification.title}
            type={notification.type}
            onView={() => navigate("/notifications")}
        />
        ));
    };

    useEffect(() => {
        const connection = getConnection();

        connection.on("ReceiveDepartmentMessage", handleReceiveDepartmentMessage);
        connection.on("ReceiveMessage", handleReceive);
        connection.on("InvitedToEvent", handleNewEvent);
        connection.on("MessagesRead", handleMessagesRead);
        connection.on("ClearUnreadBadge", clearUnreadBadge);
        connection.on("UserOnline", handleUserOnline);
        connection.on("UserOffline", handleUserOffline);
        connection.on("ReceiveMyMessage", handleReceive);

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
            connection.off("UserOnline", handleUserOnline);
            connection.off("UserOffline", handleUserOffline);
            connection.off("ReceiveMyMessage", handleReceive);
            connection.on("ReceiveNotification", handleReceiveNotification);
        };
    }, [selectedUser?.userId]);
};