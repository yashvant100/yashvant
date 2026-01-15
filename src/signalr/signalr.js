import * as signalR from "@microsoft/signalr";

export const createConnection = () => {
  return new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7027/chatHub", {
      // ✅ ALWAYS get latest token
      accessTokenFactory: () => {
        return localStorage.getItem("token");
      },
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000]) // better reconnect
    .configureLogging(signalR.LogLevel.Information) // optional (debug)
    .build();
};
