"use client";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "8px",
          padding: 0,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.04)",
          minWidth: 0,
        },
      }}
      containerStyle={{
        top: 12,
        zIndex: 99999,
      }}
    />
  );
} 