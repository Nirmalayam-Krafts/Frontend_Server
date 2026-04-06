import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "../hook/admin"; // adjust path if needed

export default function ProtectedRoute({ children }) {
    const { data, isLoading, isError } = useCurrentUser();
    const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5ef]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2f4f2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2f4f2f] font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!data || isError) {
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
  }

  return children;
}