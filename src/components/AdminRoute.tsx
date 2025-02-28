import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
  const { data: isAdminUser, isLoading } = useQuery({
    queryKey: ['admin'],
    queryFn: isAdmin
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAdminUser ? <Outlet /> : <Navigate to="/admin/login" />;
}