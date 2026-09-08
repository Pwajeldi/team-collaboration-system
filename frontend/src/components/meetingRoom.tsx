import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { useMeetingRoom } from "../hooks/useMeetingRoom";
import "../styles/meetingRoom.css";

type MeetingRoomProps = {
    meetingId: string;
    participantNames: Record<string, string>; // my userId > fullName
    onLeave: () => void;
};

const VideoTile = ({ stream, name, status, muted }: { stream: MediaStream | null; name: string; status?: string; muted?: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) videoRef.current.srcObject = stream;
    }, [stream]);

    return (
        <div className={`meeting-tile ${status === "disconnected" ? "reconnecting" : ""}`}>
            <video ref={videoRef} autoPlay playsInline muted={muted} />
            {status === "disconnected" && <div className="meeting-tile-overlay">Reconnecting…</div>}
            {status === "connecting" && <div className="meeting-tile-overlay">Connecting…</div>}
            <span className="meeting-tile-name">{name}</span>
        </div>
    );
};

const MeetingRoom = ({ meetingId, participantNames, onLeave }: MeetingRoomProps) => {
    const { localStream, remoteStreams, participantStatus, micOn, camOn, toggleMic, toggleCam, joinError } =
        useMeetingRoom(meetingId);

    if (joinError) {
        return (
            <div className="meeting-room meeting-room-error">
                <p>{joinError}</p>
                <button className="meeting-control-btn leave" onClick={onLeave}>Close</button>
            </div>
        );
    }

    return (
        <div className="meeting-room">
            <div className="meeting-grid">
                <VideoTile stream={localStream} name="You" muted />
                {Object.entries(remoteStreams).map(([userId, stream]) => (
                    <VideoTile
                        key={userId}
                        stream={stream}
                        name={participantNames[userId] ?? "Participant"}
                        status={participantStatus[userId]}
                    />
                ))}
                {Object.entries(participantStatus)
                    .filter(([userId]) => !remoteStreams[userId])
                    .map(([userId, status]) => (
                        <VideoTile key={userId} stream={null} name={participantNames[userId] ?? "Participant"} status={status} />
                    ))}
            </div>

            <div className="meeting-controls">
                <button className={`meeting-control-btn ${!micOn ? "off" : ""}`} onClick={toggleMic} aria-label="Toggle mic">
                    {micOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <button className={`meeting-control-btn ${!camOn ? "off" : ""}`} onClick={toggleCam} aria-label="Toggle camera">
                    {camOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>
                <button className="meeting-control-btn leave" onClick={onLeave} aria-label="Leave meeting">
                    <PhoneOff size={18} />
                </button>
            </div>
        </div>
    );
};

export default MeetingRoom;