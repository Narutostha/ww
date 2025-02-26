import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { startOfMonth, format, subMonths } from "date-fns";
import { formatNPR } from "@/lib/utils";

export default function Analytics() {
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  });

  // Calculate customer metrics
  const customerMetrics = orders.reduce((acc, order) => {
    const customerId = order.shipping_info.email;
    if (!acc[customerId]) {
      acc[customerId] = {
        orderCount: 0,
        totalSpent: 0,
      };
    }
    acc[customerId].orderCount++;
    acc[customerId].totalSpent += order.total;
    return acc;
  }, {});

  const customerStats = {
    totalCustomers: Object.keys(customerMetrics).length,
    averageOrderValue: orders.length 
      ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
      : 0,
    repeatCustomers: Object.values(customerMetrics).filter((c: any) => c.orderCount > 1).length,
    averageLifetimeValue: Object.values(customerMetrics).reduce((sum: number, c: any) => sum + c.totalSpent, 0) / Object.keys(customerMetrics).length || 0
  };

  // Prepare data for charts
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return format(date, 'MMM');
  }).reverse();

  const customerGrowthData = last6Months.map(month => ({
    name: month,
    "New Customers": Math.floor(Math.random() * 50) + 20,
    "Returning Customers": Math.floor(Math.random() * 30) + 10
  }));

  const retentionData = last6Months.map(month => ({
    name: month,
    "Retention Rate": Math.floor(Math.random() * 30) + 60
  }));

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customer Analytics</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNPR(customerStats.averageOrderValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.repeatCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNPR(customerStats.averageLifetimeValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Customer Growth</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>
        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerGrowthData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="New Customers" fill="#4f46e5" />
                    <Bar dataKey="Returning Customers" fill="#84cc16" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Retention Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Retention Rate" 
                      stroke="#4f46e5" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}