import { Search } from "lucide-react";
import { useGetUsers } from "../hooks/memberHook";
import "../styles/userList.css";
import Loader from "./loader";
import { useEffect, useState } from "react";
import UserListItem from "./userListItem";


const UserList = () => {  
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
                    <UserListItem key={user.userId} user={user}/>
                )
                })}
            </div>
        </aside>
    );
};

export default UserList;