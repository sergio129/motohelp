"use client";

import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
          },
          success: {
            style: {
              background: "#065f46",
              color: "#d1fae5",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#065f46",
            },
          },
          error: {
            style: {
              background: "#7f1d1d",
              color: "#fee2e2",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#7f1d1d",
            },
          },
        }}
      />
      {children}
    </>
  );
}
