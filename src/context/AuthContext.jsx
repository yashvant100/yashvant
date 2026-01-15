import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { login } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Load token on refresh
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      const decoded = jwtDecode(saved);

      setUser({
        id: Number(
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ]
        ),
        email:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        token: saved,
      });
    }
    setLoading(false);
  }, []);

  // 🔐 Login
  const loginUser = async (email, password) => {
    const jwt = await login(email, password);
    const decoded = jwtDecode(jwt);

    const userObj = {
      id: Number(
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]
      ),
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      token: jwt,
    };

    localStorage.setItem("token", jwt);
    setUser(userObj);
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.token, // backward compatibility
        loginUser,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
