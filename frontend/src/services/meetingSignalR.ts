import * as signalR from "@microsoft/signalr";
import { API_URL } from "../api/axios";

let connection: signalR.HubConnection | null = null;

export const getMeetingConnection = () => {
    if (connection) return connection;

    connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/meetinghub`, {
            accessTokenFactory: () => sessionStorage.getItem("accessToken") ?? "",
        })
        .withAutomaticReconnect()
        .build();

    return connection;
};

export const stopMeetingConnection = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};