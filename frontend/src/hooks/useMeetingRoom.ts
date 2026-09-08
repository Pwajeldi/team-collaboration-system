import { useCallback, useEffect, useRef, useState } from "react";
import { getMeetingConnection, stopMeetingConnection } from "../services/meetingSignalR";

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const DISCONNECT_TIMEOUT_MS = 60_000;

export type ParticipantStatus = "connecting" | "connected" | "disconnected";

export const useMeetingRoom = (meetingId: string) => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
    const [participantStatus, setParticipantStatus] = useState<Record<string, ParticipantStatus>>({});
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [joinError, setJoinError] = useState<string | null>(null);

    const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
    const disconnectTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const localStreamRef = useRef<MediaStream | null>(null);

    const closePeerConnection = useCallback((userId: string) => {
        peerConnections.current[userId]?.close();
        delete peerConnections.current[userId];

        setRemoteStreams(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
        setParticipantStatus(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });

        if (disconnectTimers.current[userId]) {
            clearTimeout(disconnectTimers.current[userId]);
            delete disconnectTimers.current[userId];
        }
    }, []);

    const startDisconnectTimer = useCallback((userId: string) => {
        if (disconnectTimers.current[userId]) return; // already counting down
        disconnectTimers.current[userId] = setTimeout(() => closePeerConnection(userId), DISCONNECT_TIMEOUT_MS);
    }, [closePeerConnection]);

    const clearDisconnectTimer = useCallback((userId: string) => {
        if (disconnectTimers.current[userId]) {
            clearTimeout(disconnectTimers.current[userId]);
            delete disconnectTimers.current[userId];
        }
        setParticipantStatus(prev => ({ ...prev, [userId]: "connected" }));
    }, []);

    const getOrCreatePeerConnection = useCallback((targetUserId: string) => {
        if (peerConnections.current[targetUserId]) return peerConnections.current[targetUserId];

        const pc = new RTCPeerConnection(ICE_SERVERS);

        localStreamRef.current?.getTracks().forEach(track => {
            pc.addTrack(track, localStreamRef.current!);
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                getMeetingConnection()
                    .invoke("SendIceCandidate", targetUserId, JSON.stringify(event.candidate))
                    .catch(console.error);
            }
        };

        pc.ontrack = (event) => {
            setRemoteStreams(prev => ({ ...prev, [targetUserId]: event.streams[0] }));
            setParticipantStatus(prev => ({ ...prev, [targetUserId]: "connected" }));
        };

        peerConnections.current[targetUserId] = pc;
        return pc;
    }, []);

    useEffect(() => {
        let cancelled = false;

        const setup = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (cancelled) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            localStreamRef.current = stream;
            setLocalStream(stream);

            const connection = getMeetingConnection();

            connection.on("ExistingParticipants", (userIds: string[]) => {
                setParticipantStatus(prev => {
                    const next = { ...prev };
                    userIds.forEach(id => { next[id] = "connecting"; });
                    return next;
                });
            });

            connection.on("ParticipantJoined", async (userId: string) => {
                setParticipantStatus(prev => ({ ...prev, [userId]: "connecting" }));
                const pc = getOrCreatePeerConnection(userId);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                await connection.invoke("SendOffer", userId, JSON.stringify(offer));
            });

            connection.on("ReceiveOffer", async (fromUserId: string, offerJson: string) => {
                const pc = getOrCreatePeerConnection(fromUserId);
                await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(offerJson)));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await connection.invoke("SendAnswer", fromUserId, JSON.stringify(answer));
            });

            connection.on("ReceiveAnswer", async (fromUserId: string, answerJson: string) => {
                const pc = peerConnections.current[fromUserId];
                if (!pc) return;
                await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(answerJson)));
            });

            connection.on("ReceiveIceCandidate", async (fromUserId: string, candidateJson: string) => {
                const pc = peerConnections.current[fromUserId];
                if (!pc) return;
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(JSON.parse(candidateJson)));
                } catch (err) {
                    console.error("Failed to add ICE candidate", err);
                }
            });

            connection.on("ParticipantDisconnected", (userId: string) => {
                setParticipantStatus(prev => ({ ...prev, [userId]: "disconnected" }));
                startDisconnectTimer(userId);
            });

            connection.on("ParticipantReconnected", (userId: string) => {
                clearDisconnectTimer(userId);
            });

            connection.on("ParticipantLeft", (userId: string) => {
                closePeerConnection(userId);
            });

            connection.on("MeetingJoinRejected", (reason: string) => {
                setJoinError(reason);
            });

            if (connection.state === "Disconnected") {
                await connection.start();
            }
            await connection.invoke("JoinMeeting", meetingId);
        };

        setup().catch(err => {
            console.error("Failed to set up meeting:", err);
            setJoinError("Couldn't access camera/microphone, or failed to join.");
        });

        return () => {
            cancelled = true;
            const connection = getMeetingConnection();
            connection.invoke("LeaveMeeting", meetingId).catch(() => {});
            connection.off("ExistingParticipants");
            connection.off("ParticipantJoined");
            connection.off("ReceiveOffer");
            connection.off("ReceiveAnswer");
            connection.off("ReceiveIceCandidate");
            connection.off("ParticipantDisconnected");
            connection.off("ParticipantReconnected");
            connection.off("ParticipantLeft");
            connection.off("MeetingJoinRejected");

            Object.keys(peerConnections.current).forEach(closePeerConnection);
            Object.values(disconnectTimers.current).forEach(clearTimeout);
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            stopMeetingConnection();
        };
    }, [meetingId]);

    const toggleMic = () => {
        localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setMicOn(prev => !prev);
    };

    const toggleCam = () => {
        localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setCamOn(prev => !prev);
    };

    return { localStream, remoteStreams, participantStatus, micOn, camOn, toggleMic, toggleCam, joinError };
};