import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { 
  ShoppingBag, Heart, Search, SlidersHorizontal, Lock, ChevronRight,
  ChevronDown, Eye, Star, StarHalf, ArrowUpDown, Filter, X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, isAuthenticated } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatNPR } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

interface ProductSelections {
  [key: string]: {
    selectedSize?: string;
    selectedColor?: string;
  };
}

export default function Products() {
  const { dispatch } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [productSelections, setProductSelections] = useState<ProductSelections>({});
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("grid");
  
  // Update active filters count whenever filters change
  useEffect(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedSize !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
    setActiveFilters(count);
  }, [searchQuery, selectedSize, priceRange]);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const { data: isAuth } = useQuery({
    queryKey: ['auth'],
    queryFn: isAuthenticated
  });

  const handleAddToCart = (product: any) => {
    if (!isAuth) {
      setShowAuthDialog(true);
      return;
    }

    const selections = productSelections[product.id] || {};
    
    if (!selections.selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (!selections.selectedColor && product.color.length > 0) {
      toast.error("Please select a color");
      return;
    }

    const cartItemId = `${product.id}-${selections.selectedSize}-${selections.selectedColor}`;
    
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: cartItemId,
        productId: product.id,
        name: `${product.name} (${selections.selectedSize}, ${selections.selectedColor || 'Default'})`,
        price: product.price,
        quantity: 1,
        image: product.main_image,
        size: selections.selectedSize,
        color: selections.selectedColor
      },
    });

    setProductSelections(prev => ({
      ...prev,
      [product.id]: { selectedSize: undefined, selectedColor: undefined }
    }));

    toast.success("Added to cart");
  };

  const handleSizeSelect = (productId: string, size: string) => {
    if (!isAuth) {
      setShowAuthDialog(true);
      return;
    }
    setProductSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], selectedSize: size }
    }));
  };

  const handleColorSelect = (productId: string, color: string) => {
    if (!isAuth) {
      setShowAuthDialog(true);
      return;
    }
    setProductSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], selectedColor: color }
    }));
  };

  const handleWishlist = () => {
    if (!isAuth) {
      setShowAuthDialog(true);
      return;
    }
    toast.success("Added to wishlist");
  };

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleCreateAccount = () => {
    navigate('/auth/register');
  };
  
  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
  };
  
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSize("all");
    setPriceRange([0, 100000]);
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedSize === "all" || product.sizes.includes(selectedSize)) &&
      product.price >= priceRange[0] && 
      product.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Get all unique sizes from products
  const allSizes = Array.from(
    new Set(products.flatMap(product => product.sizes))
  ).sort();
  
  return (
    <div className="min-h-screen bg-[#FCF7F5]">
      <SEO 
        title="Shop | Blu Away"
        description="Browse our latest urban streetwear collection. From premium puffer jackets to stylish t-shirts, find your perfect piece."
        keywords="streetwear, urban fashion, puffer jackets, t-shirts, sustainable clothing"
      />
      <Navbar />
      <Sidebar />

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
      
      {/* Quick View Dialog */}
      {quickViewProduct && (
        <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
          <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 bg-gray-100">
                <div className="aspect-square relative">
                  <img 
                    src={quickViewProduct.main_image} 
                    alt={quickViewProduct.name}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">{quickViewProduct.name}</DialogTitle>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <StarHalf className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="text-sm text-gray-500 ml-1">(24 reviews)</span>
                  </div>
                </DialogHeader>
                
                <div className="my-4">
                  <p className="text-lg font-bold text-gray-900">
                    {formatNPR(quickViewProduct.price)}
                  </p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <Label className="block mb-2 font-medium">Size</Label>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((size: string) => (
                        <Button
                          key={size}
                          variant={productSelections[quickViewProduct.id]?.selectedSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSizeSelect(quickViewProduct.id, size)}
                          className="h-9 min-w-[40px] hover:bg-black hover:text-white transition-colors"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {quickViewProduct.color.length > 0 && (
                    <div>
                      <Label className="block mb-2 font-medium">Color</Label>
                      <div className="flex gap-2">
                        {quickViewProduct.color.map((color: string) => (
                          <div
                            key={color}
                            className={`w-8 h-8 rounded-full border cursor-pointer transform hover:scale-110 transition-transform duration-200 ${
                              productSelections[quickViewProduct.id]?.selectedColor === color ? 'ring-2 ring-black' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                            onClick={() => handleColorSelect(quickViewProduct.id, color)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(quickViewProduct)}
                    className="flex-1 bg-black hover:bg-black/90 text-white"
                    disabled={quickViewProduct.stock === 0}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {quickViewProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    variant="outline"
                    className="px-4 hover:bg-red-50 hover:text-red-500 transition-colors"
                    onClick={handleWishlist}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <p className="mb-2">• Free shipping on orders over NPR 5,000</p>
                  <p>• 30-day easy returns</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="max-w-7xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Enhanced Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.h1 
                className="text-4xl font-bold tracking-tight text-gray-900"
                variants={item}
              >
                Our Collection
              </motion.h1>
              <motion.p 
                className="mt-2 text-lg text-gray-600"
                variants={item}
              >
                Discover our latest urban streetwear pieces
              </motion.p>
            </div>
            
            <motion.div 
              className="flex items-center gap-3"
              variants={item}
            >
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <button 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {activeFilters > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="bg-white text-gray-700 gap-1.5"
                >
                  <X className="h-4 w-4" /> Clear filters ({activeFilters})
                </Button>
              )}
            </motion.div>
          </div>

          {/* Search and filters row */}
          <motion.div
            className="flex flex-col md:flex-row gap-4"
            variants={item}
          >
            {/* Enhanced Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 rounded-lg border-gray-200 focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50 text-base"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="relative min-w-[200px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full h-12 border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4 text-gray-500" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 px-5 gap-2 bg-white text-gray-900 border-gray-200">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFilters > 0 && (
                    <Badge className="h-5 w-5 p-0 text-xs flex items-center justify-center ml-1 bg-black text-white">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[350px] sm:w-[450px]">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xl">Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search
                  </SheetDescription>
                </SheetHeader>
                
               
                  
                  {/* Size Filter */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Size</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        variant={selectedSize === "all" ? "default" : "outline"}
                        onClick={() => setSelectedSize("all")}
                        className="h-10"
                      >
                        All
                      </Button>
                      {allSizes.map(size => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          onClick={() => setSelectedSize(size)}
                          className="h-10"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Price Range (NPR)</h3>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        placeholder="Min"
                        className="w-full border-gray-300"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        placeholder="Max"
                        className="w-full border-gray-300"
                      />
                    </div>
                  </div>
                  
                  {/* Color Filter (example) */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#FFFF00", "#00FF00", "#808080", "#FFA500"].map(color => (
                        <div
                          key={color}
                          className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer hover:ring-2 hover:ring-gray-500 transition"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                
                
                <div className="flex items-center gap-3 mt-8 pt-4 border-t">
                  <SheetClose asChild>
                    <Button variant="outline" className="flex-1">Cancel</Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="flex-1 bg-black hover:bg-black/90">Apply Filters</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>

          {/* Product Display */}
          {isLoading ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  className={`group animate-pulse ${viewMode === 'list' ? 'flex gap-4' : ''}`}
                >
                  <div className={`${viewMode === 'grid' ? 'aspect-[3/4]' : 'w-1/3 aspect-square'} bg-gray-200 rounded-lg`} />
                  <div className={`${viewMode === 'grid' ? 'mt-4' : 'flex-1'} space-y-2`}>
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    {viewMode === 'list' && (
                      <>
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-10 bg-gray-200 rounded w-1/3" />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <motion.div variants={item}>
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-sm border border-gray-200">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full opacity-70 blur-sm"></div>
                  <div className="relative bg-white p-3 rounded-full shadow-md">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <h2 className="mt-6 text-2xl font-bold text-gray-800">Sign In To See The Products</h2>
                
                <p className="mt-3 text-gray-600 text-center max-w-md">
                  To browse our exclusive collection and see all available products, please sign in to your account.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button 
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
                    onClick={handleSignIn}
                  >
                    Sign In
                  </button>
                  <button 
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-300 shadow-sm transition-colors duration-200"
                    onClick={handleCreateAccount}
                  >
                    Create Account
                  </button>
                </div>
                
                <a href="#" className="mt-6 flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                  <span>Continue as guest</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
                
                <div className="mt-8 pt-6 border-t border-gray-200 w-full max-w-md">
                  <p className="text-sm text-gray-500 text-center">
                    By signing in, you'll get access to exclusive deals, personalized recommendations, and early access to new arrivals.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10' 
              : 'space-y-6'
            }>
              {filteredProducts.map((product) => {
                const selections = productSelections[product.id] || {};
                const isHovered = hoveredProduct === product.id;
                
                return (
                  <motion.div
                    key={product.id}
                    variants={item}
                    className={`group relative ${viewMode === 'list' ? 'flex gap-6 bg-white rounded-lg p-4 shadow-sm' : ''}`}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <Link to={`/products/${product.id}`} className={viewMode === 'list' ? 'w-1/3' : 'block'}>
                    <div className={`${viewMode === 'grid' ? 'aspect-square' : 'aspect-square'} relative overflow-hidden rounded-lg bg-gray-100`}>
                        <img
                          src={product.main_image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        />
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Quick view button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            className="bg-white text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                            onClick={(e) => {
                              e.preventDefault();
                              handleQuickView(product);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">Quick view</span>
                          </button>
                        </div>
                        
                        
                    
                    {/* Stock status badges */}
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1">
                        Only {product.stock} left
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1">
                        Out of Stock
                      </Badge>
                    )}
                    
                    {/* Wishlist button */}
                    <button
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleWishlist();
                      }}
                    >
                      <Heart className={`w-4 h-4 ${isHovered ? 'text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </Link>

                <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-4'} space-y-2`}>
                  <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
                    <div>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-sm md:text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Rating stars */}
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                          <StarHalf className="w-3 h-3 text-yellow-400 fill-current" />
                        </div>
                        <span className="text-xs text-gray-500 ml-1">(18)</span>
                      </div>
                    </div>
                    
                    <p className="text-sm md:text-base font-medium text-gray-900">
                      {formatNPR(product.price)}
                    </p>
                  </div>
                  
                  {viewMode === 'list' && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                      {product.description || "Premium quality urban streetwear for your unique style. Made with sustainable materials and designed for comfort and durability."}
                    </p>
                  )}

                  <div className={`space-y-3 ${viewMode === 'list' ? 'mt-4' : 'mt-2'}`}>
                    {/* Size buttons with improved styling */}
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selections.selectedSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSizeSelect(product.id, size)}
                          className={`h-7 text-xs px-2 min-w-[32px] transition-colors ${
                            selections.selectedSize === size 
                              ? 'bg-black text-white hover:bg-black/90' 
                              : 'hover:bg-black hover:text-white border-gray-300'
                          }`}
                          disabled={product.stock === 0}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>

                    {/* Color options with improved styling */}
                    {product.color && product.color.length > 0 && (
                      <div className="flex gap-1">
                        {product.color.map((color) => (
                          <div
                            key={color}
                            className={`w-6 h-6 rounded-full border cursor-pointer transform hover:scale-110 transition-transform duration-200 ${
                              selections.selectedColor === color ? 'ring-2 ring-black ring-offset-1' : ''
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                            onClick={() => handleColorSelect(product.id, color)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Add to cart and wishlist buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        size="sm"
                        className={`flex-1 h-9 transition-all duration-300 ${
                          product.stock === 0 
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                            : 'bg-black hover:bg-black/90 text-white'
                        }`}
                        disabled={product.stock === 0}
                      >
                        <ShoppingBag className="w-4 h-4 mr-1" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                      
                      {viewMode === 'grid' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-500 transition-colors border-gray-300"
                          onClick={handleWishlist}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <motion.div 
          className="flex justify-center mt-10"
          variants={item}
        >
          <nav className="flex items-center gap-1 bg-white rounded-lg shadow-sm p-1">
            <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-md bg-black text-white">1</button>
            <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100">2</button>
            <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100">3</button>
            <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </motion.div>
      )}
      
      {/* Newsletter signup */}
      <motion.div 
        className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg"
        variants={item}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Join our community</h2>
          <p className="text-gray-300 mb-6">Sign up for our newsletter and get 10% off your first order</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input 
              placeholder="Enter your email" 
              className="flex-1 bg-white/10 border-gray-700 text-white placeholder:text-gray-400 focus:border-gray-500" 
            />
            <Button className="bg-white text-gray-900 hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </div>
</div>
);
}