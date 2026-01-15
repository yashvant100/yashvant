import * as signalR from "@microsoft/signalr";

export const createConnection = () => {
  const token = localStorage.getItem("token");

  return new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7027/chatHub", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .build();
};
