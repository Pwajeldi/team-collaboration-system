import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query"
import { getMember, updateMember, createMember, deleteMember, getMembers, getUsersToDM, fetchOnlineUsers, } from "../api/memberApi"
import type { CreateMemberDto, MemberQueryParams, UpdateMemberDto } from "../types/types";
import {useQueryClient} from "@tanstack/react-query"

export const useGetMember = (memberId: string) => {
    return useQuery({
        queryKey: ['member', memberId],
        queryFn: () => getMember(memberId),
    })
};

export const useGetMembers = (page:number, pageSize:number, filters: MemberQueryParams) => {
    return useQuery({
        queryKey: ['members', page, pageSize, filters],
        queryFn: () => getMembers(page, pageSize, filters),
        placeholderData: keepPreviousData
    })
};

export const useCreateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(payload: CreateMemberDto) => createMember(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        }
    })
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMember,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        }
    })
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:({id, updates}: {id: string, updates: UpdateMemberDto}) => updateMember(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        }
    })
}

export const useGetUsers = (filters?: MemberQueryParams) => {
    return useQuery({
        queryKey: ['userList', filters],
        queryFn: () => getUsersToDM(filters),
    })
}

export const useOnlineUsers = () => {
    return useQuery({
        queryKey: ["online-users"],
        queryFn: fetchOnlineUsers,
        staleTime: Infinity,
    });
}

export const useIsUserOnline = (userId?: string) => {
    const {data} = useOnlineUsers();
    return !!userId && (data?.includes(userId) ?? false);
}