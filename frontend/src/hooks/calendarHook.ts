import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, deleteEvent, fetchEvents, updateEvent, updateEventDuration } from "../api/calendarApi";
import toast from "react-hot-toast";


export const useGetEvents = () => {
    return useQuery({
        queryKey: ["events"],
        queryFn: fetchEvents,
        placeholderData: keepPreviousData,
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
            toast.success("Event created")
        },
        onError: (error) => toast.error(`${error.message}`),
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["events"]});
            toast.success(`Event cancelled`)
        },
        onError:(error) => toast.error(`${error.message}`)
    })
}


export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["events"]});
            toast.success("Event has been updated");
        },
        onError:(error) => toast.error(`${error.message}`)
    })
}

export const useUpdateEventDuration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateEventDuration,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["events"]});
        },
        onError:(error) => toast.error(`${error.message}`)
    })
}
