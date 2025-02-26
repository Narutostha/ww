import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";

export default function About() {
  return (
    <div className="min-h-screen bg-shop">
      <Sidebar />
      <Cart />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto pt-24 px-8"
      >
        <h1 className="text-4xl font-light mb-12 text-[#868686]">ABOUT US</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6 text-[#868686]">
            <p>
              Founded in 2025, our brand represents the perfect fusion of urban style and sustainable fashion. 
              We believe in creating clothing that not only looks good but also feels good - both for you and the planet.
            </p>
            
            <p>
              Every piece in our collection is crafted with attention to detail, using eco-friendly materials 
              and ethical manufacturing processes. We work closely with our partners to ensure fair labor 
              practices and minimize our environmental impact.
            </p>
            
            <p>
              Our mission is to redefine streetwear by combining contemporary design with sustainability, 
              making fashion that's both trendy and responsible.
            </p>
          </div>
          
          <div>
            <img 
              src="/" 
              alt="About Us" 
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}