import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Jika token tidak ada, atau user tidak ada, atau user bukan ADMIN -> tendang ke login
  if (!token || !user || user.role.toUpperCase() !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  // Jika dia adalah admin dan sudah login, izinkan mengakses rute di dalamnya 
    (<Outlet />)
  return <Outlet />;
};

export default ProtectedRoute;