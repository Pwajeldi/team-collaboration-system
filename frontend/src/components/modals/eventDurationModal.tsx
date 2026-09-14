import { Calendar, Clock4, MoveRight, X } from "lucide-react"
import type { UpdateEventTimeDto } from "../../types/types";
import "../../styles/eventDurationModal.css";
import { useUpdateEventDuration } from "../../hooks/calendarHook";
import toast from "react-hot-toast";

type DurationProps = {
    eventDto?: UpdateEventTimeDto,
    onClose: () => void
}

const dateOption: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
} 

const timeOption: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
}

const UpdateEventDurationModal = ({eventDto, onClose}: DurationProps) => {
    const dateString = new Date(eventDto?.newStartTime ?? "").toLocaleDateString("en-US", dateOption);
    const newStartTime = new Date(eventDto?.newStartTime ?? "").toLocaleTimeString("en-us", timeOption);
    const newEndTime = new Date(eventDto?.newEndTime ?? "").toLocaleTimeString("en-us", timeOption);
    const updateDuration = useUpdateEventDuration();
    const handleUpdateDuration = async() => {
        if(!eventDto){
            toast.error("No event to update");
            return;
        }
        await updateDuration.mutateAsync(eventDto);
        onClose();
    }

    if(updateDuration.isSuccess){
        toast.success(`${updateDuration.data}`)
    }
    return(
        <div className="update-duration-overlay" onClick={onClose}>
            <div className="update-duration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="update-duration-x">
                    <button className="event-modal-close" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                </div>
                <div className="clock-icon">
                    <div className="clock-wrapper">
                        <Clock4 size={25} color="#6264A7"/>
                    </div>            
                </div>
                <div className="update-duration-header">
                    <h2>Update Event Time</h2>
                    <p>Do you want to update the duration of this event?</p>
                </div>
                <div className="update-duration-details">
                    <div className="update-duration-details-header">
                        <h3>Team Sync</h3>
                    </div>
                    <div className="update-duration-details-date">
                        <Calendar size={18}/>
                        <span>{dateString}</span>
                    </div>
                    <div className="update-duration-time">
                        <div className="update-duration-item">
                            <div className="clock-time">
                                <div className="clock-wrap">
                                    <Clock4 size={21} color="#474852"/>
                                </div>
                                <div className="updated-time">
                                    <p>New Start Time</p>
                                    <span>{newStartTime}</span>
                                </div>             
                            </div>
                        </div>
                        <MoveRight size={18} color="rgb(110, 110, 110)"/>
                        <div className="update-duration-item">
                            <div className="clock-time">
                                <div className="clock-wrap">
                                    <Clock4 size={21} color="#474852"/>
                                </div>
                                <div className="updated-time">
                                    <p>New End Time</p>
                                    <span>{newEndTime}</span>
                                </div>                              
                            </div>
                        </div>
                    </div>
                </div>
                <div className="update-duration-actions">
                    <button className="update-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="update-time-btn" onClick={handleUpdateDuration}>
                        Update Time
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UpdateEventDurationModal