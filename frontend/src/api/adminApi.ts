import type { UpdateMemberDto } from "../types/types";
import api from "./axios";

export const updateMember = async ({ id, payload }: { id: string; payload: UpdateMemberDto }) => {
    const { data } = await api.put(`/team/update/${id}`, payload);
    return data;
};

export const deleteMember = async (id: string) => {
    await api.delete(`/team/delete/${id}`);
};