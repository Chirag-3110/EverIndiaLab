import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  // ✅ Login: store user + token
  function login(data: { user: any; token: string }) {
    if (!data?.user || !data?.token) return;
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  // ✅ Logout: clear everything
  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lab");
    localStorage.removeItem("token");
  }

  // Add to AuthProvider
  function updateUser(newUser: any) {
    console.log(newUser);
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  // ✅ Load from localStorage when app starts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("lab");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
