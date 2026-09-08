import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const getMeetingConnection = () => {
    if (connection) return connection;

    connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:4000/hubs/meetinghub", {
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