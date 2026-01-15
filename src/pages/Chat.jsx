import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../api/usersApi";
import { loadHistory } from "../api/chatApi";
import { createConnection } from "../signalr/chatHub";
import "./Chat.css";

export default function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [connection, setConnection] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const typingTimeout = useRef(null);

  // ================= LOAD USERS =================
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  // ================= LOAD CHAT HISTORY =================
  useEffect(() => {
    if (!selectedUser || !user) return;

    loadHistory(selectedUser).then(data => {
      setMessages(
        data.map(m => ({
          id: m.id,
          fromMe: m.senderId === user.id,
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString()
        }))
      );
    });
  }, [selectedUser, user]);

  // ================= SIGNALR =================
  useEffect(() => {
    if (!user?.token) return;

    const conn = createConnection(user.token);

    conn.start().then(() => console.log("✅ SignalR Connected"));

    conn.on("ReceiveMessage", (msg) => {
      setMessages(prev => [
        ...prev,
        {
          id: msg.id,
          fromMe: msg.senderId === user.id,
          text: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString()
        }
      ]);
    });

    conn.on("UserOnline", (id) => {
      setOnlineUsers(prev => [...new Set([...prev, id])]);
    });

    conn.on("UserOffline", (id) => {
      setOnlineUsers(prev => prev.filter(x => x !== id));
    });

    setConnection(conn);
    return () => conn.stop();
  }, [user]);

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!message.trim() || !connection || !selectedUser) return;

    // ✅ Optimistic UI (NO REFRESH)
    setMessages(prev => [
      ...prev,
      {
        fromMe: true,
        text: message,
        time: new Date().toLocaleTimeString()
      }
    ]);

    await connection.invoke("SendMessage", selectedUser, message);
    setMessage("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <h3>Users</h3>
        {users.map(u => (
          <div
            key={u.userId}
            className={`user ${selectedUser === u.userId ? "active" : ""}`}
            onClick={() => setSelectedUser(u.userId)}
          >
            {u.username}
            {onlineUsers.includes(u.userId) && <span> 🟢</span>}
          </div>
        ))}
        <button onClick={handleLogout}>Logout</button>
      </aside>

      <section className="chat-area">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.fromMe ? "me" : "other"}`}>
              <div>{m.text}</div>
              <small>{m.time}</small>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </section>
    </div>
  );
}
