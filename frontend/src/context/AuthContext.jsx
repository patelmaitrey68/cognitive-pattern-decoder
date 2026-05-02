
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (data) => {
    // Store user data and tokens
    localStorage.setItem("user", JSON.stringify(data.user || data));
    if (data.token) localStorage.setItem("token", data.token);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user || data);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};