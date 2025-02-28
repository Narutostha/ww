import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, CreditCard, Phone, Copy, MessageSquare, ArrowRight, ShoppingBag } from "lucide-react";
import { formatNPR } from "@/lib/utils";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

export default function ThankYou() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Get order details from location state
  useEffect(() => {
    if (location.state?.orderDetails) {
      setOrderDetails(location.state.orderDetails);
    } else {
      // If no order details, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-[#FCF7F5] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium mb-4">No order information found</h2>
          <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF7F5]">
      <Sidebar />
      <Navbar />
      
      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thank You for Your Order!</h1>
            <p className="mt-2 text-lg text-gray-600">
              Your order #{orderDetails.orderId.slice(0, 8)} has been placed successfully
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {orderDetails.paymentMethod === 'fonepay' ? (
                  <>
                    <CreditCard className="h-5 w-5 text-green-500" />
                    Complete Your Payment
                  </>
                ) : (
                  <>
                    <Phone className="h-5 w-5 text-blue-500" />
                    Order Confirmation
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {orderDetails.paymentMethod === 'fonepay' ? (
                  "Please complete your payment using Fonepay"
                ) : (
                  "You will receive a confirmation call between 10am-6pm"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {orderDetails.paymentMethod === 'fonepay' ? (
                <>
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png" 
                        alt="Fonepay QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Total: {formatNPR(orderDetails.total)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Scan the QR code with your Fonepay app to complete payment
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Merchant Name</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">Blu Away</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard("Urban Streetwear")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium">Amount</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{formatNPR(orderDetails.total)}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(orderDetails.total.toString())}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Reference</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono">{orderDetails.orderId.slice(0, 8)}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(orderDetails.orderId.slice(0, 8))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertTitle>WhatsApp Verification</AlertTitle>
                    <AlertDescription>
                      After payment, please send a screenshot of your payment confirmation to WhatsApp number: 9802338967
                    </AlertDescription>
                  </Alert>
                </>
              ) : (
                <>
                  <Alert>
                    <Phone className="h-4 w-4" />
                    <AlertTitle>Phone Confirmation</AlertTitle>
                    <AlertDescription>
                      You will receive a confirmation call between 10am-6pm to verify your order details and arrange delivery.
                    </AlertDescription>
                  </Alert>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm">Order ID</p>
                      <p className="text-sm font-mono">{orderDetails.orderId.slice(0, 8)}</p>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm">Total Amount</p>
                      <p className="text-sm font-medium">{formatNPR(orderDetails.total)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm">Payment Method</p>
                      <p className="text-sm">Cash on Delivery</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                onClick={() => navigate('/orders')} 
                className="w-full"
              >
                View Your Orders
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/products')}
                className="w-full"
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Order Confirmation</h3>
                  <p className="text-gray-600">You'll receive an email confirmation with your order details.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Order Processing</h3>
                  <p className="text-gray-600">We'll prepare your items for shipping within 1-2 business days.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium">Shipping</h3>
                  <p className="text-gray-600">Your order will be shipped and you'll receive tracking information.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-medium">Delivery</h3>
                  <p className="text-gray-600">Your items will be delivered to your doorstep.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
     </div>
  );
}