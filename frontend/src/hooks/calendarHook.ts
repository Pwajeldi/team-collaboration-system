import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEvent, deleteEvent, fetchEvents, updateEvent } from "../api/calendarApi";
import { getUsersToDM } from "../api/memberApi";


export const useGetEvents = () => {
    return useQuery({
        queryKey: ["events"],
        queryFn: fetchEvents,
        placeholderData: keepPreviousData
    });
};

export const useCreateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["events"] });
        },
    });
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["events"]})
        }
    })
}

export const useFetchPotentialAttendees = () => {
    return useQuery({
        queryKey:["potential_attendees"],
        queryFn: getUsersToDM,
        placeholderData:keepPreviousData,
    })
}

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["events"]})
        }
    })
}
