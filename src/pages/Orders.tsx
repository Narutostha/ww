import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Loader2, Package, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";

const statusColors = {
  PENDING: "bg-yellow-500",
  PROCESSING: "bg-blue-500",
  SHIPPED: "bg-purple-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

const SafeBadge = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <Badge className={className}>
      <span>{children}</span>
    </Badge>
  );
};

export default function Orders() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            id,
            product_id,
            size,
            quantity,
            price,
            selected_color,
            products:products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCF7F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF7F5]">
      <Sidebar />
      <Cart />
      
      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-light text-[#333]">My Orders</h1>
            <Button onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start shopping to create your first order
              </p>
              <Button onClick={() => navigate('/products')} className="mt-4">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono">{order.id}</p>
                      </div>
                      <SafeBadge className={statusColors[order.status]}>
                        {order.status}
                      </SafeBadge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Ordered on
                        </p>
                        <p>{format(new Date(order.created_at), 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="font-medium">NPR {order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flow-root">
                        <ul className="-my-6 divide-y divide-gray-200">
                          {order.items.map((item) => (
                            <li key={item.id} className="py-6 flex">
                              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                {item.products ? (
                                  <img
                                    src={item.products.main_image}
                                    alt={item.products.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3>
                                      {item.products?.name || "Product no longer available"}
                                    </h3>
                                    <p className="ml-4">NPR {item.price.toFixed(2)}</p>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2">
                                    {item.size && (
                                      <SafeBadge variant="outline" className="text-xs">
                                        {item.size}
                                      </SafeBadge>
                                    )}
                                    {item.selected_color && (
                                      <div 
                                        className="w-4 h-4 rounded-full border"
                                        style={{ backgroundColor: item.selected_color }}
                                        title={item.selected_color}
                                      />
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <p className="text-gray-500">
                                    Qty {item.quantity}
                                  </p>
                                  {item.products && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/products/${item.product_id}`)}
                                    >
                                      Buy Again
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}