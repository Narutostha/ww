import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";

export default function Sustainability() {
  const initiatives = [
    {
      title: "Recycled Materials",
      description: "We use recycled materials in our products, including recycled polyester from plastic bottles and recycled cotton from pre-consumer waste.",
      image: "/lovable-uploads/cfefd328-0bcf-4b27-a6c9-fa9c6b1cb3d9.png"
    },
    {
      title: "Ethical Production",
      description: "All our products are made in factories that meet strict environmental and social standards, ensuring fair wages and safe working conditions.",
      image: "/lovable-uploads/f28aa2dd-8b13-4a67-93fa-878e5fc802e4.png"
    },
    {
      title: "Zero Waste",
      description: "We're working towards zero waste in our production process, with a goal to recycle or reuse all textile waste by 2026.",
      image: "/lovable-uploads/ff77a521-3d1d-48f3-a1dc-7aac803f9296.png"
    }
  ];

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
        <h1 className="text-4xl font-light mb-12 text-[#868686]">SUSTAINABILITY</h1>
        
        <div className="space-y-6 text-[#868686] mb-12">
          <p className="text-lg">
            We believe that fashion should never come at the expense of our planet. 
            Our commitment to sustainability is at the core of everything we do, 
            from the materials we choose to the way we package and ship our products.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {initiatives.map((initiative, index) => (
            <motion.div
              key={initiative.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <img 
                src={initiative.image} 
                alt={initiative.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-medium text-[#868686] mb-4">
                  {initiative.title}
                </h3>
                <p className="text-[#868686]">
                  {initiative.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-light text-[#868686] mb-6">
            Our Commitment
          </h2>
          <div className="space-y-4 text-[#868686]">
            <p>
              By 2026, we aim to :
            </p>
            <ul className="list-disc list-inside space-y-2">
            <li>New Road TO New York</li>
              <li>Use 100% sustainable or recycled materials in our products</li>
              <li>Achieve carbon neutrality in our operations</li>
              <li>Eliminate single-use plastics from our packaging</li>
              <li>Ensure full supply chain transparency</li>
              <li>Implement a take-back program for used clothing</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}