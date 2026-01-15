import * as signalR from "@microsoft/signalr";

export const createChatConnection = (token) => {
  return new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7027/chatHub", {
      accessTokenFactory: () => token, // 🔥 JWT here
    })
    .withAutomaticReconnect()
    .build();
};
