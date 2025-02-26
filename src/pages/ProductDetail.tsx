import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, ShoppingBag, Loader2, Truck, Shield, RefreshCw, Upload } from "lucide-react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";
import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { getProduct, isAuthenticated } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNPR } from "@/lib/utils";
import { ShippingInfo } from "@/components/ui/shipping-info";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over NPR 10,000"
  },
  {
    icon: Shield,
    title: "2 Year Warranty",
    description: "Full coverage"
  },
  {
    icon: RefreshCw,
    title: "Free Returns",
    description: "Within 30 days"
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id as string),
    enabled: !!id
  });

  const { data: isAuth } = useQuery({
    queryKey: ['auth'],
    queryFn: isAuthenticated
  });

  // Combine all product images into one array
  const allPhotos = product ? [
    product.main_image,
    product.featured_image,
    ...(product.photos || [])
  ].filter(Boolean) : [];

  const handleAddToCart = () => {
    if (!isAuth) {
      setShowAuthDialog(true);
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selectedColor && product?.color?.length > 0) {
      toast.error("Please select a color");
      return;
    }

    if (!product) return;

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: cartItemId,
        productId: product.id,
        name: `${product.name} (${selectedSize}, ${selectedColor || 'Default'})`,
        price: product.price,
        quantity: 1,
        image: product.main_image,
        size: selectedSize,
        color: selectedColor
      },
    });
    toast.success("Added to cart");
  };

  const handleWishlist = () => {
    if (!isAuth) {
      setShowAuthDialog(true);
      return;
    }
    // Wishlist functionality here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCF7F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FCF7F5] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900">Product not found</h2>
          <p className="mt-2 text-gray-500">The product you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF7F5]">
      <SEO 
        title={product.name}
        description={product.description.join(" ")}
        keywords={`${product.name.toLowerCase()}, streetwear, urban fashion`}
        image={product.main_image}
      />
      <Sidebar />
      <Cart />

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              Please sign in to add items to your cart and access all features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Sign In
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth/register')}
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#333] mb-8 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-xl">
              <motion.img
                key={currentPhotoIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={allPhotos[currentPhotoIndex]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {allPhotos.map((photo, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden bg-white shadow-md transition-transform ${
                    currentPhotoIndex === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <img
                    src={photo}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold text-gray-900">{formatNPR(product.price)}</p>
              {product.stock <= 5 && product.stock > 0 && (
                <Badge className="mt-2 bg-yellow-500">Only {product.stock} left</Badge>
              )}
              {product.stock === 0 && (
                <Badge className="mt-2 bg-red-500">Out of Stock</Badge>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">COLOR</h3>
                <div className="flex gap-3">
                  {product.color.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`group relative w-12 h-12 rounded-full transition-all duration-300 ${
                        selectedColor === color 
                          ? 'ring-2 ring-offset-2 ring-black scale-110' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {selectedColor === color && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">SIZE</h3>
                <div className="grid grid-cols-4 gap-3">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 text-base font-medium ${
                        selectedSize === size 
                          ? 'bg-black text-white hover:bg-black/90' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                <button 
                  onClick={() => navigate('/size-guide')}
                  className="text-sm text-gray-600 underline mt-2 hover:text-black transition-colors"
                >
                  Size Guide
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 text-base font-medium bg-black hover:bg-black/90"
                  disabled={product.stock === 0}
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-12 p-0 hover:bg-red-50 hover:text-red-500 transition-colors"
                  onClick={handleWishlist}
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center p-4 rounded-lg bg-white shadow-sm"
                >
                  <feature.icon className="w-6 h-6 mb-2 text-gray-600" />
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>

            <Tabs defaultValue="details" className="pt-8">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Product Details</TabsTrigger>
                <TabsTrigger value="shipping" className="flex-1">Shipping Info</TabsTrigger>
                <TabsTrigger value="returns" className="flex-1">Returns</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <div className="space-y-4 text-gray-600">
                  {product.description.map((desc, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-black mt-2" />
                      <p>{desc}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4">
                <ShippingInfo />
              </TabsContent>
              <TabsContent value="returns" className="mt-4">
                <div className="space-y-4 text-gray-600">
                  <p>• Free returns within 30 days</p>
                  <p>• Items must be unworn with original tags</p>
                  <p>• Return shipping label provided</p>
                  <p>• Refunds processed within 5-7 business days</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}