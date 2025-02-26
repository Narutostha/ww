import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/supabase";
import { formatNPR } from "@/lib/utils";
import { ShippingInfo } from "@/components/ui/shipping-info";

const CartPage = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const { data: isAuth } = useQuery({
    queryKey: ['auth'],
    queryFn: isAuthenticated
  });

  const handleAddItem = (itemId: string) => {
    const item = state.items.find((i) => i.id === itemId);
    if (item) {
      dispatch({ type: "ADD_ITEM", payload: item });
    }
  };

  const handleReduceItem = (itemId: string) => {
    dispatch({ type: "REDUCE_QUANTITY", payload: itemId });
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId });
  };

  const handleCheckout = () => {
    if (!isAuth) {
      navigate('/auth/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF7F5] relative">
      <Sidebar />
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-start pt-24 px-4 md:px-8 max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-light mb-12 text-[#868686]">CART</h1>
        
        {state.items.length === 0 ? (
          <div className="text-center">
            <p className="text-lg font-light text-[#868686] mb-6">
              YOUR CART IS EMPTY
            </p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
            >
              CONTINUE SHOPPING
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-8">
            <div className="space-y-4">
              {state.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between border-b border-gray-200 py-4"
                >
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="text-lg text-[#333]">{item.name}</h3>
                      <p className="text-[#868686]">{formatNPR(item.price)}</p>
                      {item.size && (
                        <p className="text-sm text-[#868686]">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-[#868686]">Color:</span>
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleReduceItem(item.id)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center text-[#333]">{item.quantity}</span>
                      <Button
                        onClick={() => handleAddItem(item.id)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleRemoveItem(item.id)}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border-t pt-6">
              <ShippingInfo />
            </div>

            <div className="mt-8 flex flex-col items-end">
              <p className="text-xl text-[#333] mb-4">
                Total: {formatNPR(state.total)}
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/products')}
                >
                  Continue Shopping
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {isAuth ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartPage;