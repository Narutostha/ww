import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { formatNPR } from "@/lib/utils";

interface Order {
  id: string;
  shipping_info: {
    firstName?: string;
    lastName?: string;
    email?: string;
    name?: string; // For backwards compatibility
  };
  total: number;
  created_at: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="space-y-8">
      {orders.map((order) => {
        // Handle both new and old shipping info formats
        const firstName = order.shipping_info?.firstName || order.shipping_info?.name?.split(' ')[0] || '';
        const lastName = order.shipping_info?.lastName || order.shipping_info?.name?.split(' ')[1] || '';
        const initials = [firstName, lastName]
          .map(n => n[0])
          .filter(Boolean)
          .join('') || '?';

        return (
          <div key={order.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shipping_info?.email || 'No email provided'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="ml-auto font-medium">+{formatNPR(order.total)}</div>
          </div>
        );
      })}
    </div>
  );
}