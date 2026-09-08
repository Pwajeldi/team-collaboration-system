import { Search } from "lucide-react";
import { useChat } from "../contexts/chatContext";
import { useGetUsers } from "../hooks/memberHook";
import { getInitials } from "../services/getInitials";
import "../styles/userList.css";
import Loader from "./loader";
import { useEffect, useState } from "react";


const UserList = () => {  
    const {selectedUser, setSelectedUser} = useChat();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [showSearchInput, setShowSearchInput] = useState(false);
    const query = useGetUsers({
        search: searchTerm,
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDebouncedSearchTerm(e.target.value);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(debouncedSearchTerm);
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    },[debouncedSearchTerm])

    const toggleSearchInput = () => {
        setShowSearchInput(prev => !prev);
        if(showSearchInput) setSearchTerm("");
    }

    if (query.isLoading) return <Loader/>;
    if (query.isError) return <div className="user-list-error">Couldn't load users.</div>;

    return (
        <aside className="user-list">
            <div className="user-list-header">
                <div className="user-list-header-item">
                    <span>Chat</span>
                    <button onClick={toggleSearchInput}>{<Search size={17}/>}</button>
                </div>
                    <div className={`user-list-header-input ${showSearchInput ? "show" : ""}`}>
                        <input 
                        onChange={handleSearchChange}
                        value={debouncedSearchTerm}
                        type="text" placeholder="Search users..." />
                    </div>
            </div>

            <div className="user-list-scroll">
                {query.data?.map(user => {
                    return(
                    <button
                        key={user.userId}
                        className={`user-list-item ${selectedUser?.userId === user.userId ? "active" : ""}`}
                        onClick={() => setSelectedUser({userId:user.userId, fullName: user.fullName})}
                    >
                        <span className="avatar">{getInitials(user.fullName)}</span>
                        <span className="user-name">{user.fullName}</span>
                        {user.unreadMessages > 0 && <span className="unread-badge">{user.unreadMessages > 20 ? "20+" : user.unreadMessages}</span>}
                    </button>
                )
                })}
            </div>
        </aside>
    );
};

export default UserList;