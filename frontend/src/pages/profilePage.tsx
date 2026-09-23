// profilePage.tsx
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Loader from "../components/loader";
import { useGetMyProfile, useResetPassword, useUpdateMyProfile, useUploadProfilePicture } from "../hooks/profileHook"
import { useFetchDepartments } from "../hooks/departmentHook"
import "../styles/profilePage.css"
import { getInitials } from "../services/getInitials";
import type { PasswordResetDto, UpdateProfileDto } from "../types/types";
import toast from "react-hot-toast";
import { Eye, EyeOffIcon, Pencil } from "lucide-react";
import ImageUploadModal from "../components/modals/imageUploadModal";
import {SiGithub, SiFacebook, SiX, SiLinkerd,} from "react-icons/si"

const dateOptions: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
    day: "numeric"
}



const MyProfile = () => {
    const profileQuery = useGetMyProfile();
    const data = profileQuery.data;
    const dateJoined = new Date(data?.dateJoined ?? '').toLocaleDateString("en-US", dateOptions);
    const updateProfile = useUpdateMyProfile();
    const resetPassword = useResetPassword();
    const departmentsQuery = useFetchDepartments();
    const firstName = data?.firstName;
    const lastName = data?.lastName;
    const myEmail = data?.email;
    const [jobTitle] = useState(data?.jobTitle);
    const [bio, setBio] = useState(data?.bio);
    const [dob, setDob] = useState(data?.dateOfBirth ?? "");
    const [linkedinUrl, setLinkedinUrl] = useState(data?.linkedInUrl);
    const [githubUrl, setGithubUrl] = useState(data?.githubUrl);
    const [xUrl, setXUrl] = useState(data?.xurl);
    const [facebookUrl, setFacebookUrl] = useState(data?.facebookUrl);
    const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const role = data?.role;
    const [canSeePassword, setCanSeePassword] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const uploadPicture = useUploadProfilePicture();
    const [viewImageModal, setViewImageModal] = useState(false);

    const departmentName = departmentsQuery.data?.find(
        (d) => d.departmentId === data?.departmentId
    )?.departmentName ?? "—";

    const profilePayload: UpdateProfileDto = {
        bio,
        dateOfBirth: dob,
        facebookUrl,
        githubUrl,
        linkedInUrl: linkedinUrl,
        phoneNumber,
        xurl: xUrl,
    };

    useEffect(() => {
        setPhoneNumber(data?.phoneNumber);
        setDob(data?.dateOfBirth ?? "");
        setBio(data?.bio);
        setFacebookUrl(data?.facebookUrl);
        setXUrl(data?.xurl)
        setGithubUrl(data?.githubUrl);
        setLinkedinUrl(data?.linkedInUrl)
    }, 
    [data?.phoneNumber, data?.dateOfBirth, data?.bio, 
        data?.facebookUrl, data?.xurl, data?.githubUrl, data?.linkedInUrl
    ]
    )
    console.log(dob)

    const handleUpdateProfile = async () => {
        await updateProfile.mutateAsync(profilePayload);
    }

    const handleImageUpload = async () => {
        setViewImageModal(false);
        if (!selectedImage) return;
        await uploadPicture.mutateAsync(selectedImage);
    }

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error("Password inputs do not match");
            return;
        }

        const payload: PasswordResetDto = { oldPassword, newPassword, confirmNewPassword };

        try {
            await resetPassword.mutateAsync(payload);
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            console.error("Failed to reset password:", err);
        }
    }

    const toggleViewPassword = () => setCanSeePassword(prev => !prev);

    const handlePictureSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const image = e.target.files?.[0];
        if (!image) return;
        const url = URL.createObjectURL(image);

        setSelectedImage(image);
        setPreviewUrl(url);
        setViewImageModal(true);
    }

    if (profileQuery.isLoading) return <Loader/>;

    return(
        <div className="profile-page">
            <div className="profile-page-title">
                <h1>Profile & Settings</h1>
                <button onClick={handleUpdateProfile} className="update-profile-btn">
                    {updateProfile.isPending ? <Loader size="sm" fullHeight={false}/> : <span>Update profile</span>}
                </button>
            </div>

            <div className="profile-overview">
                <div className="profile-initial">
                    <div className="profile-picture">
                        {uploadPicture.isPending && previewUrl
                            ? <img src={previewUrl} alt="Profile picture" />
                            : data?.profilePictureUrl
                            ? (
                                <img
                                    src={data.profilePictureUrl}
                                    alt="Profile picture"
                                    onError={() => console.error("Failed to load profile picture:", data.profilePictureUrl)}
                                />
                            )
                            : <span>{getInitials(`${firstName} ${lastName}`)}</span>
                        }
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handlePictureSelect}/>
                    <button onClick={() => fileInputRef.current?.click()} aria-label="Change profile picture">
                        <Pencil size={13}/>
                    </button>
                </div>
                <div className="profile-overview-minidetail">
                    <p className="minidetail-name">{firstName} {lastName}</p>
                    <p className="minidetail-job">{jobTitle}</p>
                    <p className="minidetail-role">{role}</p>
                </div>

                <div className="profile-overview-details">
                    <div className="detail">
                        <span>Department</span>
                        <p>{departmentName}</p>
                    </div>
                    <div className="detail">
                        <span>Email</span>
                        <p>{myEmail}</p>
                    </div>
                    <div className="detail">
                        <span>Joined</span>
                        <p>{dateJoined}</p>
                    </div>
                </div>
            </div>

            <div className="personal-info">
                <div className="personal-info-header">
                    <h3>Personal Information</h3>
                </div>

                <div className="personal-info-input-group">
                    <div className="profile-input">
                        <label>First Name</label>
                        <input type="text" value={data?.firstName} disabled/>
                    </div>
                    <div className="profile-input">
                        <label>Last Name</label>
                        <input type="text" value={data?.lastName} disabled/>
                    </div>
                    <div className="profile-input">
                        <label>Email Address</label>
                        <input type="text" value={data?.email} disabled/>
                    </div>
                    <div className="profile-input">
                        <label>Phone Number</label>
                        <input type="tel" value={phoneNumber ?? ""} onChange={(e) => setPhoneNumber(e.target.value)}/>
                    </div>
                    <div className="profile-input">
                        <label>Job Title</label>
                        <input type="text" value={data?.jobTitle} disabled/>
                    </div>
                    <div className="profile-input">
                        <label>Department</label>
                        <input type="text" value={departmentName} disabled/>
                    </div>
                    <div className="profile-input">
                        <label>Date of Birth</label>
                        <input type="date" value={dob.split("T")[0] ?? ""} onChange={(e) => setDob(e.target.value)}/>
                    </div>
                    <div className="profile-input profile-input-full">
                        <label>Bio</label>
                        <textarea value={bio ?? ""} onChange={(e) => setBio(e.target.value)}/>
                    </div>
                </div>
            </div>

            <div className="social-links">
                <div className="social-links-header">
                    <h3>Social Links</h3>
                </div>
                <div className="social-links-group">
                    <div className="profile-input">
                        <label><SiLinkerd/> LinkedIn</label>
                        <input type="url" placeholder="https://linkedin.com/in/…" value={linkedinUrl ?? ""} onChange={(e) => setLinkedinUrl(e.target.value)}/>
                    </div>
                    <div className="profile-input">
                        <label><SiGithub /> GitHub</label>
                        <input type="url" placeholder="https://github.com/…" value={githubUrl ?? ""} onChange={(e) => setGithubUrl(e.target.value)}/>
                    </div>
                    <div className="profile-input">
                        <label><SiX/> (Twitter)</label>
                        <input type="url" placeholder="https://x.com/…" value={xUrl ?? ""} onChange={(e) => setXUrl(e.target.value)}/>
                    </div>
                    <div className="profile-input">
                        <label><SiFacebook/> Facebook</label>
                        <input type="url" placeholder="https://facebook.com/…" value={facebookUrl ?? ""} onChange={(e) => setFacebookUrl(e.target.value)}/>
                    </div>
                </div>
            </div>

            <div className="personal-security">
                <div className="personal-security-header">
                    <h3>Password & Security</h3>
                    <button onClick={handlePasswordReset} className="update-profile-btn">
                        {resetPassword.isPending ? <Loader size="sm" fullHeight={false}/> : <span>Change Password</span>}
                    </button>
                </div>
                <div className="personal-security-password">
                    <label>Current Password</label>
                    <div className="password-input-container">
                        <input type={canSeePassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/>
                        <button type="button" className="view-password" onClick={toggleViewPassword}>
                            {canSeePassword ? <EyeOffIcon/> : <Eye/>}
                        </button>
                    </div>
                </div>
                <div className="personal-security-password">
                    <label>New Password</label>
                    <div className="password-input-container">
                        <input type={canSeePassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        <button type="button" className="view-password" onClick={toggleViewPassword}>
                            {canSeePassword ? <EyeOffIcon/> : <Eye/>}
                        </button>
                    </div>
                </div>
                <div className="personal-security-password">
                    <label>Confirm New Password</label>
                    <div className="password-input-container">
                        <input type={canSeePassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}/>
                        <button type="button" className="view-password" onClick={toggleViewPassword}>
                            {canSeePassword ? <EyeOffIcon/> : <Eye/>}
                        </button>
                    </div>
                </div>
            </div>
            {viewImageModal && <ImageUploadModal onClose={()=>setViewImageModal(false)} handleUploadImage={handleImageUpload} previewUrl={previewUrl}/>}
        </div>
    )
}

export default MyProfile