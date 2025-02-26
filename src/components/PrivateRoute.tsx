import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function PrivateRoute() {
  const { data: isAuth, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: isAuthenticated
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return isAuth ? <Outlet /> : <Navigate to="/auth/login" />;
}