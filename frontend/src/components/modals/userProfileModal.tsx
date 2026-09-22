import { Calendar, Link2, Mail, MessageCircle, Phone, X } from "lucide-react";
import { SiGithub, SiLinkerd, SiX, } from "react-icons/si";
import { useNavigate } from "react-router";
import Loader from "../loader";
import { useFetchUserProfile } from "../../hooks/profileHook";
import { useFetchDepartments } from "../../hooks/departmentHook";
import { useIsUserOnline } from "../../hooks/memberHook";
import { useChat } from "../../contexts/chatContext";
import { getInitials } from "../../services/getInitials";
import "../../styles/userProfileModal.css";

type UserProfileModalProps = {
    userId: string;
    showProfile: boolean;
    onClose: () => void;
};

const dateOptions: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };

const UserProfileModal = ({ userId, showProfile, onClose }: UserProfileModalProps) => {
    const profileQuery = useFetchUserProfile(userId);
    const departmentsQuery = useFetchDepartments();
    const isOnline = useIsUserOnline(userId);
    const { setSelectedUser } = useChat();
    const navigate = useNavigate();

    const data = profileQuery.data;
    const departmentName = departmentsQuery.data?.find(d => d.departmentId === data?.departmentId)?.departmentName;

    const handleSendMessage = () => {
        if (!data) return;
        setSelectedUser({ userId, fullName: `${data.firstName} ${data.lastName}`,profilePictureUrl:data.profilePictureUrl ? data.profilePictureUrl : null});
        onClose();
        navigate("/chat");
    };

    return (
        <div className={`user-profile-overlay ${showProfile ? "show" : ""}`} onClick={onClose}>
            <div className={`user-profile-modal ${showProfile ? "open" : ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="user-profile-header">
                    <button onClick={onClose} aria-label="Close">
                        <X size={22} color="#fff" />
                    </button>
                </div>

                {profileQuery.isLoading && <Loader />}
                {profileQuery.isError && <div className="user-profile-error">Couldn't load this profile.</div>}

                {data && (
                    <div className="user-profile-body">
                        <div className="user-info-top">
                            <div className="user-picture-wrapper">
                                <div className="user-picture-container">
                                    {data.profilePictureUrl
                                        ? <img src={data.profilePictureUrl} alt={`${data.firstName} ${data.lastName}`} />
                                        : <span className="user-picture-initials">{getInitials(`${data.firstName} ${data.lastName}`)}</span>
                                    }
                                </div>
                            </div>
                            <div className="user-info-details">
                                <div className="detail-item">
                                    <h2>{data.firstName} {data.lastName}</h2>
                                    <span className={`online-status ${isOnline ? "online" : "offline"}`}>
                                        <i className="status-dot" /> {isOnline ? "Online" : "Offline"}
                                    </span>
                                </div>
                                {data.jobTitle && <p className="user-job-title">{data.jobTitle}</p>}
                                <div className="detail-role">{data.role}</div>
                            </div>
                        </div>

                        <div className="user-contact-list">
                            <div className="user-detail-personal">
                                <Mail size={16} /> <p>{data.email}</p>
                            </div>
                            {data.phoneNumber && (
                                <div className="user-detail-personal">
                                    <Phone size={16} /> <p>{data.phoneNumber}</p>
                                </div>
                            )}
                            <div className="user-detail-personal">
                                <Calendar size={16} /> <p>Joined {new Date(data.dateJoined).toLocaleDateString("en-US", dateOptions)}</p>
                            </div>
                        </div>

                        {(data.linkedInUrl || data.githubUrl || data.xurl || data.facebookUrl) && (
                            <div className="user-social-row">
                                {data.linkedInUrl && (
                                    <a href={data.linkedInUrl} target="_blank" rel="noreferrer" className="social-icon-btn linkedin">
                                        <SiLinkerd size={16} />
                                    </a>
                                )}
                                {data.githubUrl && (
                                    <a href={data.githubUrl} target="_blank" rel="noreferrer" className="social-icon-btn github">
                                        <SiGithub size={16} />
                                    </a>
                                )}
                                {data.xurl && (
                                    <a href={data.xurl} target="_blank" rel="noreferrer" className="social-icon-btn x">
                                        <SiX size={16} />
                                    </a>
                                )}
                                {data.facebookUrl && (
                                    <a href={data.facebookUrl} target="_blank" rel="noreferrer" className="social-icon-btn facebook">
                                        <Link2 size={16} />
                                    </a>
                                )}
                            </div>
                        )}

                        <div className="user-info-grid">
                            <div className="user-info-card">
                                <span>Department</span>
                                <p>{departmentName ?? "—"}</p>
                            </div>
                            <div className="user-info-card">
                                <span>Role</span>
                                <p>{data.role}</p>
                            </div>
                        </div>

                        {data.bio && (
                            <div className="user-bio-section">
                                <h3>Bio</h3>
                                <p>{data.bio}</p>
                            </div>
                        )}

                        <button className="send-message-btn" onClick={handleSendMessage}>
                            <MessageCircle size={16} /> Send Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileModal;