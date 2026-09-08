import { createContext, useContext, useState, type ReactNode } from "react";

export type selectedUser = {
    userId: string,
    fullName: string
}

type ChatContextType = {
    selectedUser: selectedUser|null;
    setSelectedUser: (user: selectedUser|null) => void;
};

const ChatContext = createContext<ChatContextType|null>(null);

export const ChatContextProvider = ({children}:{children:ReactNode}) => {
    const [selectedUser, setSelectedUser] = useState<selectedUser|null>(null);

    const value = {
        selectedUser,
        setSelectedUser
    }

    return(
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    )
}

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat must be used within a ChatContextProvider");
    return ctx;
};