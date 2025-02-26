import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/admin/Overview";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getProducts } from "@/lib/api";
import { 
  Loader2, Package, ShoppingCart, Users, Settings, BarChart3, Box, 
  TrendingUp, ArrowUpRight, DollarSign, ShoppingBag, UserPlus, ChevronRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatNPR } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.length ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    pendingOrders: orders.filter(order => order.status === 'PENDING').length,
    totalProducts: products.length,
    lowStock: products.filter(product => product.stock < 10).length,
    todayOrders: orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length
  };

  if (ordersLoading || productsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, Admin</h2>
          <p className="text-gray-500">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Last updated:</span>
          <span className="font-medium">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            title: "Total Revenue",
            value: formatNPR(stats.totalRevenue),
            icon: DollarSign,
            color: "green",
            trend: "+20.1% from last month"
          },
          {
            title: "Total Orders",
            value: stats.totalOrders.toString(),
            icon: ShoppingBag,
            color: "blue",
            trend: `${stats.pendingOrders} pending orders`
          },
          {
            title: "Products",
            value: stats.totalProducts.toString(),
            icon: Package,
            color: "purple",
            trend: `${stats.lowStock} low stock items`
          },
          {
            title: "Today's Orders",
            value: stats.todayOrders.toString(),
            icon: ShoppingCart,
            color: "yellow",
            trend: new Date().toLocaleDateString()
          }
        ].map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`bg-${stat.color}-500/10 p-3 rounded-full`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                  </div>
                </div>
                <div className={`mt-4 text-sm text-${stat.color}-600`}>
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Your store's financial performance over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <Overview />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                View all
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Latest customer purchases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={orders.slice(0, 5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}