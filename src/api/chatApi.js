import api from "./axios";

// 📜 Chat history
export const loadHistory = async (friendId) => {
  const res = await api.get(`/chat/history/${friendId}`);
  return res.data;
};
