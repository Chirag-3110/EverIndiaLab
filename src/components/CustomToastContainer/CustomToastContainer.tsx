import React from "react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function CustomToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      transition={Slide} 
      toastStyle={{
        fontSize: "0.85rem", 
        borderRadius: "8px",
        backgroundColor: "#F0FFFF",
        color: "Black",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
      }}
    />
  );
}
