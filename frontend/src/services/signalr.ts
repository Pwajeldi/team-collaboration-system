import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const getConnection = () => {
    if (connection) return connection;

    connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:4000/hubs/chathub", {
            accessTokenFactory: () => sessionStorage.getItem("accessToken") ?? "",
        })
        .withAutomaticReconnect()
        .build();

    return connection;
};

export const stopConnection = async () => {
    if (connection) {
        await connection.stop();
        connection = null;
    }
};