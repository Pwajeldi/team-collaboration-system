import { useEffect, useState } from "react";
import Loader from "../components/loader";
import { useGetMyProfile, useResetPassword, useUpdateMyProfile } from "../hooks/profileHook"
import "../styles/profilePage.css"
import { getInitials } from "../services/getInitials";
import type { PasswordResetDto, UpdateProfileDto } from "../types/types";
import toast from "react-hot-toast";
import { Eye, EyeOffIcon, Pencil } from "lucide-react";

const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric"
}

const MyProfile = () => {
    const profileQuery = useGetMyProfile();
    const data = profileQuery.data;
    const dateJoined = new Date(data?.dateJoined ?? '').toLocaleDateString("en-US", dateOptions);
    const updateProfile = useUpdateMyProfile();
    const resetPassword = useResetPassword();
    const firstName = data?.firstName;
    const lastName = data?.lastName;
    const myEmail = data?.email;
    const jobTitle = data?.jobTitle;
    const [bio, setBio] = useState(data?.bio);
    const [dob, setDob] = useState(data?.dateOfBirth);
    const [linkedinUrl, setLinkedinUrl] = useState(data?.linkedInUrl);
    const [githubUrl, setGithubUrl] = useState(data?.githubUrl);
    const [xUrl, setXUrl] = useState(data?.xurl);
    const [facebookUrl, setFacebookUrl] = useState(data?.facebookUrl);
    const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber);
    const [profilePicture, setProfilePicture] = useState(data?.profilePictureUrl);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const role = data?.role;
    const [canSeePassword, setCanSeePassword] = useState(false);

    const profilePayload: UpdateProfileDto = {
        bio: bio,
        dateOfBirth: dob,
        facebookUrl: facebookUrl,
        githubUrl: githubUrl,
        linkedInUrl: linkedinUrl,
        phoneNumber: phoneNumber,
        profilePictureUrl: profilePicture,
        xurl: xUrl
    };

    const resetPasswordPayload: PasswordResetDto = {
        oldPassword: oldPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
    } 

    const handleUpdateProfile = async () => {
        if(profilePayload){
            updateProfile.mutateAsync(profilePayload);
        }
    }

    const handlePasswordReset = () => {
        if(resetPasswordPayload){
            if(newPassword !== confirmNewPassword){
                toast.error("Password inputs do not match");
            }
            resetPassword.mutateAsync(resetPasswordPayload);
            if (resetPassword.isSuccess){
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            }
        }
    }

    const toggleViewPassword = () => {
        setCanSeePassword(prev => !prev);
    };


    if(profileQuery.isLoading){ return <Loader/>}
    return(
        <div className="profile-page">
            <div className="profile-page-title">
                <h1>Profile & Settings</h1>
            </div>
            
            <div className="profile-overview">
                <div className="profile-initial">
                    <div className="profile-picture">
                        <span>{getInitials(`${firstName} ${lastName}`)}</span>
                    </div>
                    <button onClick={() => {toast.error("to be implemented")}}>
                        {<Pencil size={13}/>}
                    </button>
                </div>
                <div className="profile-overview-minidetail">
                    <p className="minidetail-name">{firstName} {lastName}</p>
                    <p className="minidetail-job">{jobTitle}</p>
                    <p className="minidetail-role">{role}</p>
                </div>

                <div className="profile-overview-details">
                    <div className="detail">
                        <span>department</span>
                        <p>dept</p>
                    </div>
                    <div className="detail">
                        <span>email</span>
                        <p>{myEmail}</p>
                    </div>
                    <div className="detail">
                        <span>joined</span>
                        <p>{dateJoined}</p>
                    </div>
                </div>
            </div>

            <div className="account-status">
                <div className="account-status-header">
                    <h3>Account Status</h3>
                    <span>Status</span>
                </div>
                <div className="account-status-group">
                    <div className="status-info">
                        <span>Last Login</span> <p>Value</p>
                    </div>
                    <div className="status-info">
                        <span>Account Type</span> <p>Value</p>
                    </div>
                </div>
            </div>

            <div className="personal-info">
                <div className="personal-info-header">
                    <h3>Personal Information</h3>
                    <button onClick={handleUpdateProfile}
                    className="update-profile-btn">
                        {updateProfile.isPending ? <Loader size="sm" fullHeight={false}/> : <span>Update profile</span>}
                    </button>
                </div>

                <div className="personal-info-input-group">
                    <div className="profile-input">
                        <label>First Name</label>
                        <input type="text" value={firstName} disabled={true}/>
                    </div>
                    <div className="profile-input">
                        <label>Last Name</label>
                        <input type="text" value={lastName} disabled={true}/>
                    </div>
                    <div className="profile-input">
                        <label>Email Address</label>
                        <input type="text" value={myEmail} disabled={true}/>
                    </div>
                    <div className="profile-input">
                        <label>Phone Number</label>
                        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
                    </div>
                    <div className="profile-input">
                        <input type="text" value={jobTitle}/>
                    </div>
                    <div className="profile-input">
                        <label>Department</label>
                        <select disabled={true}/>
                    </div>
                    <div className="profile-input">
                        <label>Joined</label>
                        <input className="profile-input" type="" value={dob} onChange={(e) => setDob(e.target.value)}/>
                    </div>          
                    {/*<div className="profile-input"><input type="text" value={location}/></div>*/}
                    <div className="profile-input">
                        <label>Bio</label>
                        <textarea value={bio} onChange={(e) => setBio(e.target.value)}/>
                    </div>
                </div>

                {// This is to go in a modal
                /*<input className="profile-input" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)}/>
                <input className="profile-input" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}/>
                <input className="profile-input" type="url" value={xUrl} onChange={(e) => setXUrl(e.target.value)}/>
                <input className="profile-input" type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)}/>*/}
            </div>

            <div className="personal-security">
                <div className="personal-security-header">
                    <h3>Password & Security</h3>
                    <button onClick={handlePasswordReset} className="update-profile-btn">
                        {resetPassword.isPending ? <Loader size="sm" fullHeight={false}/> : <span>Change Password</span>}
                    </button>
                </div>
                <div className="personal-security-password">
                    <label>current password</label>
                    <div className="password-input-container">
                        <input type={canSeePassword ? `text` : `password`} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/>
                        <button type="button" className="view-password" onClick={toggleViewPassword}>
                            {canSeePassword ? <EyeOffIcon/> : <Eye/>}
                        </button>
                    </div>   
                </div> 
                <div className="personal-security-password">
                    <label>new password</label>
                    <div className="password-input-container">
                        <input type={canSeePassword ? `text` : `password`} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                        <button type="button" className="view-password" onClick={toggleViewPassword}>
                            {canSeePassword ? <EyeOffIcon/> : <Eye/>}
                        </button>
                    </div>      
                </div>
                <div className="personal-security-password">
                    <label>confirm new password</label>
                    <div className="password-input-container">
                        <input type={canSeePassword ? `text` : `password`} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}/>
                        <button type="button" className="view-password" onClick={toggleViewPassword}>
                            {canSeePassword ? <EyeOffIcon/> : <Eye/>}
                        </button>
                    </div>    
                </div>       
            </div>
        </div>
    )
}

export default MyProfile