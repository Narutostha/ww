import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { ShoppingCart } from "lucide-react";

const CartIcon = () => {
  const navigate = useNavigate();
  const { state } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed top-4 sm:top-8 right-4 sm:right-8 z-50"
    >
      <button 
        onClick={() => navigate('/cart')}
        className="relative p-2 text-black hover:text-gray-600 transition-colors"
        aria-label="Shopping Cart"
      >
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center">
          {state.items.reduce((total, item) => total + item.quantity, 0)}
        </span>
      </button>
    </motion.div>
  );
};

export default CartIcon;