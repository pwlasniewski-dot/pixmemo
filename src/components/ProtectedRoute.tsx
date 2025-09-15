import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ allow }: { allow: ("photographer" | "admin")[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (!allow.includes(user.role as any)) return <Navigate to="/" replace />;
  return <Outlet />;
}
