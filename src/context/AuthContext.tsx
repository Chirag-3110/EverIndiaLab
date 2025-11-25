import React, { createContext, useContext, useState, useEffect } from "react";
import { useGetAccessPermissionQuery } from "../redux/api/accessPermissionApi";

const AuthContext = createContext<any>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [staff, setStaff] = useState<any>(null);

  // ✅ Login: store user + token
  function login(data: { user: any; token: string }) {
    if (!data?.user || !data?.token) return;
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("l_t_K", data.token);
  }

  // ✅ Logout: clear everything
  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lab");
    localStorage.removeItem("l_t_K");
  }

  // Add to AuthProvider
  function updateUser(newUser: any) {
    console.log(newUser);
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  // ✅ Load from localStorage when app starts
  useEffect(() => {
    const token = localStorage.getItem("l_t_K");
    const storedUser = localStorage.getItem("lab");
    const staffUser = localStorage.getItem("staff");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));

      if (staffUser) {
        setStaff(JSON.parse(staffUser) || []);
      } else {
        setStaff([]);
      }
    } else {
      setUser(null);
      setStaff([]);
    }
  }, []);

  const isAuthenticated = !!localStorage.getItem("l_t_K");

  const accessPermissions = staff?.permissions || [];
  console.log(accessPermissions);

  return (
    <AuthContext.Provider
      value={{
        user,
        setStaff,
        login,
        logout,
        isAuthenticated,
        updateUser,
        setUser,
        accessPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
