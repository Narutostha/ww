import { useCart } from "../contexts/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, ShoppingBag, AlertCircle, Truck, CreditCard, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";
import { formatNPR } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Checkout() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [shippingMethod, setShippingMethod] = useState("domestic");
  const [paymentMethod, setPaymentMethod] = useState("fonepay");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });

  // Check authentication
  const { data: isAuth, isLoading: authLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: isAuthenticated
  });

  // Calculate shipping cost
  const shippingCost = 100; // Rs 200 for domestic shipping
  const totalWithShipping = state.total + shippingCost;

  // Redirect to login if not authenticated
  if (!authLoading && !isAuth) {
    navigate('/auth/login', { state: { from: '/checkout' } });
    return null;
  }

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (value.length < 2) error = "Must be at least 2 characters";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) error = "Must be 10 digits";
        break;
      case "postalCode":
        if (!/^\d{5,6}$/.test(value)) error = "Must be 5-6 digits";
        break;
      default:
        if (!value) error = "This field is required";
    }
    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");

    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error(authError.message);
      if (!user) throw new Error('Please sign in to place an order');

      // Validate cart
      if (state.items.length === 0) {
        throw new Error('Your cart is empty');
      }

      // Create order with shipping and payment info
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total: totalWithShipping,
          status: 'PENDING',
          shipping_info: {
            ...formData,
            shippingMethod,
            shippingCost
          },
          payment_info: {
            method: paymentMethod,
            status: 'pending'
          }
        }])
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);
      if (!order) throw new Error('Failed to create order');

      // Process each item in the cart
      for (const item of state.items) {
        try {
          if (!item.productId) {
            throw new Error(`Missing product ID for ${item.name}`);
          }
          
          // Get current stock
          const { data: product, error: stockError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.productId)
            .single();

          if (stockError) throw new Error(stockError.message);
          if (!product) throw new Error(`Product not found: ${item.name}`);

          // Check if enough stock
          if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${item.name} (only ${product.stock} available)`);
          }

          // Update stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: product.stock - item.quantity })
            .eq('id', item.productId);

          if (updateError) throw new Error(updateError.message);

          // Create order item
          const { error: itemError } = await supabase
            .from('order_items')
            .insert([{
              order_id: order.id,
              product_id: item.productId,
              size: item.size || '',
              selected_color: item.color || '',
              quantity: item.quantity,
              price: item.price
            }]);

          if (itemError) throw new Error(itemError.message);
        } catch (itemError: any) {
          // If there's an error processing an item, delete the order and throw
          await supabase
            .from('orders')
            .delete()
            .eq('id', order.id);
          throw new Error(`Error processing ${item.name}: ${itemError.message}`);
        }
      }
      
      // Clear cart
      dispatch({ type: 'CLEAR_CART' });
      
      // Navigate to thank you page with order details
      navigate('/thank-you', { 
        state: { 
          orderDetails: {
            orderId: order.id,
            total: totalWithShipping,
            paymentMethod,
            shippingInfo: formData
          }
        }
      });
      
    } catch (error: any) {
      console.error('Checkout error:', error);
      setGeneralError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FCF7F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FCF7F5] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add some items to your cart before proceeding to checkout
            </p>
            <Button 
              onClick={() => navigate('/products')}
              className="w-full bg-black hover:bg-black/90 text-white"
            >
              Browse Products
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF7F5]">
      <Sidebar />
      <Cart />
      
      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Checkout Form */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
            
            <AnimatePresence>
              {generalError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{generalError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={errors.postalCode ? "border-red-500" : ""}
                    disabled={loading}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={errors.country ? "border-red-500" : ""}
                  disabled={loading}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                )}
              </div>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={shippingMethod}
                    onValueChange={setShippingMethod}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="domestic" id="domestic" />
                        <Label htmlFor="domestic">Domestic Shipping</Label>
                      </div>
                      <span className="font-medium">Rs {shippingCost.toFixed(2)}</span>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value="fonepay" id="fonepay" />
                      <div className="flex-1">
                        <Label htmlFor="fonepay" className="flex items-center gap-2">
                          Fonepay
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          After checkout, a QR code scanner will pop up for payment. For additional verification, send the payment screenshot via WhatsApp to 9802338967.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex-1">
                        <Label htmlFor="cod" className="flex items-center gap-2">
                          Cash on Delivery
                          <Phone className="h-4 w-4 text-blue-500" />
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          You will get a call between 10am-6pm for confirmation.
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-black/90 text-white h-12"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  `Pay ${formatNPR(totalWithShipping)}`
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="md:sticky md:top-24 self-start">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="divide-y divide-gray-100">
                {state.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatNPR(item.price * item.quantity)}</div>
                        <div className="text-sm text-gray-500">
                          {formatNPR(item.price)} each
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-medium">{formatNPR(state.total)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">Shipping</p>
                  <p className="font-medium">{formatNPR(shippingCost)}</p>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <p>Total</p>
                  <p>{formatNPR(totalWithShipping)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}
