import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Package, MapPin, Phone, Mail, User, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch order data
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
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
            products:products(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );
  }

  const statusColors = {
    PENDING: "bg-yellow-500",
    PROCESSING: "bg-blue-500",
    SHIPPED: "bg-purple-500",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-500",
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/admin/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
        </div>
        <Badge className={statusColors[order.status]}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Order ID</dt>
                <dd className="text-sm font-mono">{order.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="text-sm">
                  {format(new Date(order.created_at), 'PPP')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Total</dt>
                <dd className="text-sm font-medium">NPR {order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm">
                  {order.shipping_info.firstName} {order.shipping_info.lastName}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <dd className="text-sm">{order.shipping_info.email}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <dd className="text-sm">{order.shipping_info.phone}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <address className="text-sm not-italic space-y-1">
              <div>{order.shipping_info.address}</div>
              <div>{order.shipping_info.city}</div>
              <div>{order.shipping_info.postalCode}</div>
              <div>{order.shipping_info.country}</div>
            </address>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={item.products.image} 
                          alt={item.products.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{item.products.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {item.products.description[0]}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.size}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.products.color.map((color, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>NPR {item.price.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">
                    NPR {(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">
                  Subtotal
                </TableCell>
                <TableCell className="font-medium">
                  NPR {order.total.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">
                  Shipping
                </TableCell>
                <TableCell className="font-medium">
                  {order.total >= 105 ? 'Free' : 'NPR 5.00'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="font-bold text-lg">
                  NPR {order.total.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}