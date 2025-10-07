import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // check token in localStorage

  if (!token) {
    // No token, redirect to signin
    return <Navigate to="/signin" replace />;
  }
  // User is authenticated, render the protected component
  return children;
}
