import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api";
import { 
  Search, Mail, Phone, MapPin, Package, DollarSign, 
  TrendingUp, Users, Calendar, ShoppingBag, Clock,
  CreditCard, ArrowUpRight, ChevronRight
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { motion } from "framer-motion";
import { formatNPR } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface CustomerProfile {
  email: string;
  name: string;
  orders: any[];
  totalSpent: number;
  lastOrder: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

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

export default function Customers() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  // Process orders to create customer profiles
  const customerProfiles = orders.reduce((acc, order) => {
    const email = order.shipping_info.email;
    if (!acc[email]) {
      acc[email] = {
        email,
        name: `${order.shipping_info.firstName} ${order.shipping_info.lastName}`,
        orders: [],
        totalSpent: 0,
        lastOrder: order.created_at,
        phone: order.shipping_info.phone,
        address: order.shipping_info.address,
        city: order.shipping_info.city,
        country: order.shipping_info.country
      };
    }
    acc[email].orders.push(order);
    acc[email].totalSpent += order.total;
    acc[email].lastOrder = new Date(order.created_at) > new Date(acc[email].lastOrder) 
      ? order.created_at 
      : acc[email].lastOrder;
    return acc;
  }, {} as Record<string, CustomerProfile>);

  const filteredCustomers = Object.values(customerProfiles).filter(customer => 
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate customer metrics
  const metrics = {
    totalCustomers: Object.keys(customerProfiles).length,
    activeCustomers: Object.values(customerProfiles).filter(c => 
      new Date(c.lastOrder) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
      : 0,
    customerLifetimeValue: Object.values(customerProfiles).length > 0
      ? Object.values(customerProfiles).reduce((sum, c) => sum + c.totalSpent, 0) / Object.values(customerProfiles).length
      : 0
  };

  // Generate spending trend data
  const generateSpendingData = (customer: CustomerProfile) => {
    const monthlySpending = customer.orders.reduce((acc, order) => {
      const month = format(new Date(order.created_at), 'MMM yyyy');
      acc[month] = (acc[month] || 0) + order.total;
      return acc;
    }, {});

    return Object.entries(monthlySpending).map(([month, total]) => ({
      month,
      total
    }));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage and analyze your customer base</p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{metrics.totalCustomers}</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-full">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <TrendingUp className="mr-2 h-4 w-4" />
                +12% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">{metrics.activeCustomers}</p>
                </div>
                <div className="bg-green-500/10 p-3 rounded-full">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                Last 30 days
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Order Value</p>
                  <p className="text-2xl font-bold">{formatNPR(metrics.averageOrderValue)}</p>
                </div>
                <div className="bg-yellow-500/10 p-3 rounded-full">
                  <ShoppingBag className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-yellow-600">
                <TrendingUp className="mr-2 h-4 w-4" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Lifetime Value</p>
                  <p className="text-2xl font-bold">{formatNPR(metrics.customerLifetimeValue)}</p>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-full">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-purple-600">
                <TrendingUp className="mr-2 h-4 w-4" />
                +15.3% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>Manage and view detailed customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.email} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {customer.orders.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {formatNPR(customer.totalSpent)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDistanceToNow(new Date(customer.lastOrder), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.city && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {customer.city}, {customer.country}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCustomer(customer)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Profile
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedCustomer.email}
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {selectedCustomer.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Total Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedCustomer.orders.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Spent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNPR(selectedCustomer.totalSpent)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Average Order Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNPR(selectedCustomer.totalSpent / selectedCustomer.orders.length)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generateSpendingData(selectedCustomer)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: number) => formatNPR(value)}
                          labelStyle={{ color: 'black' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono">{order.id.slice(0, 8)}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 bg-${
                                order.status === 'DELIVERED' ? 'green' :
                                order.status === 'SHIPPED' ? 'blue' :
                                order.status === 'PROCESSING' ? 'yellow' :
                                'red'
                              }-500`} />
                              {order.status}
                            </div>
                          </TableCell>
                          <TableCell>{formatNPR(order.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}