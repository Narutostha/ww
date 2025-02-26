import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";
import { Button } from "@/components/ui/button";

export default function Foundation() {
  const projects = [
    {
      title: "Youth Education",
      description: "Supporting underprivileged youth through education and mentorship programs.",
      image: "/lovable-uploads/cfefd328-0bcf-4b27-a6c9-fa9c6b1cb3d9.png",
      impact: "1,000+ students supported"
    },
    {
      title: "Environmental Conservation",
      description: "Protecting and restoring natural habitats through community-led initiatives.",
      image: "/lovable-uploads/f28aa2dd-8b13-4a67-93fa-878e5fc802e4.png",
      impact: "10,000+ trees planted"
    },
    {
      title: "Community Development",
      description: "Building sustainable communities through infrastructure and skill development.",
      image: "/lovable-uploads/ff77a521-3d1d-48f3-a1dc-7aac803f9296.png",
      impact: "50+ communities served"
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
        <h1 className="text-4xl font-light mb-12 text-[#868686]">OUR FOUNDATION</h1>
        
        <div className="space-y-6 text-[#868686] mb-12">
          <p className="text-lg">
            The Foundation was established with a simple yet powerful mission: 
            to create positive change in communities around the world. Through our 
            initiatives, we strive to make a lasting impact on education, 
            environmental conservation, and community development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <img 
                src={project.image} 
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-medium text-[#868686] mb-2">
                  {project.title}
                </h3>
                <p className="text-[#868686] mb-4">
                  {project.description}
                </p>
                <div className="text-sm font-medium text-[#868686] bg-gray-100 px-3 py-1 rounded-full inline-block">
                  {project.impact}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-light text-[#868686] mb-6">
            Support Our Cause
          </h2>
          <p className="text-[#868686] mb-8 max-w-2xl mx-auto">
            Every purchase from our store contributes directly to our foundation's work. 
            You can also make a direct donation to support our initiatives.
          </p>
          <Button 
            className="bg-[#868686] hover:bg-[#666666] text-white px-8"
            onClick={() => window.open('#', '_blank')}
          >
            Make a Donation
          </Button>
        </div>
      </motion.div>
    </div>
  );
}