import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAuthenticated, signOut } from "@/lib/supabase";
import { LogIn, LogOut, UserPlus, Package, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: isAuth, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: isAuthenticated,
    staleTime: 0,
    cacheTime: 0
  });

  const { state } = useCart();

  const handleSignOut = async () => {
    await signOut();
    queryClient.invalidateQueries();
    navigate('/');
  };

  const NavButton = ({ to, icon: Icon, label, onClick, showBadge = false, badgeCount = 0 }) => (
    <Button
      variant="ghost"
      size="sm"
      asChild={!onClick}
      onClick={onClick}
      className={cn(
        "text-[#868686] hover:text-black relative",
        "md:flex md:gap-2",
        "h-9 px-2 md:px-3"
      )}
    >
      {onClick ? (
        <div className="flex items-center">
          <Icon className="h-4 w-4" />
          <span className="hidden md:inline ml-2">{label}</span>
          {showBadge && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {badgeCount}
            </span>
          )}
        </div>
      ) : (
        <Link to={to} className="flex items-center">
          <Icon className="h-4 w-4" />
          <span className="hidden md:inline ml-2">{label}</span>
          {showBadge && badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {badgeCount}
            </span>
          )}
        </Link>
      )}
    </Button>
  );

  return (
    <div className="fixed top-4 right-4 sm:right-8 z-50 flex items-center gap-1 md:gap-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
      <NavButton
        to="/cart"
        icon={ShoppingCart}
        label="Cart"
        showBadge
        badgeCount={state.items.length}
      />

      {isAuth ? (
        <>
          <NavButton
            to="/orders"
            icon={Package}
            label="Orders"
          />
          <NavButton
            to="/profile"
            icon={User}
            label="Profile"
          />
          <NavButton
            icon={LogOut}
            label="Sign Out"
            onClick={handleSignOut}
          />
        </>
      ) : (
        <>
          <NavButton
            to="/auth/login"
            icon={LogIn}
            label="Sign In"
          />
          <NavButton
            to="/auth/register"
            icon={UserPlus}
            label="Register"
          />
        </>
      )}
    </div>
  );
}