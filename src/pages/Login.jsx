import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser, token } = useAuth();
  const navigate = useNavigate();

  // ✅ Auto redirect
  useEffect(() => {
    if (token) navigate("/chat", { replace: true });
  }, [token, navigate]);

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
    } catch {
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>💬 Yash Web Messenger</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
