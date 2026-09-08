import { useState } from "react";
import Loader from "../components/loader";
import { useGetMyProfile, useUpdateMyProfile } from "../hooks/profileHook"
import "../styles/profilePage.css"

const MyProfile = () => {
    const profileQuery = useGetMyProfile();
    const data = profileQuery.data;
    const updateProfile = useUpdateMyProfile();
    const [firstName] = useState(data?.firstName);
    const [lastName] = useState(data?.lastName);
    const [bio, setBio] = useState(data?.bio);
    const [dob, setDob] = useState(data?.dateOfBirth);
    const [linkedinUrl, setLinkedinUrl] = useState(data?.linkedInUrl);
    const [githubUrl, setGithubUrl] = useState(data?.githubUrl);
    const [xUrl, setXUrl] = useState(data?.xurl);
    const [facebookUrl, setFacebookUrl] = useState(data?.facebookUrl);
    const [phoneNumber, setPhoneNumber] = useState(data?.phoneNumber);
    const [profilePicture, setProfilePicture] = useState(data?.profilePictureUrl);


    if(profileQuery.isLoading){ return <Loader/>}
    return(
        <div className="profile-page">   
            <div className="base-profile">
                <div className="profile-picture">
                    {profilePicture}
                </div>
                Profile
                <h2>{firstName} {lastName}</h2>
            </div>
            <div className="editable-profile">
                <input type="text" value={bio} onChange={(e) => setBio(e.target.value)}/>
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}/>
            </div>
        </div>
    )
}

export default MyProfile