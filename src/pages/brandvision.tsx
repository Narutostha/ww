import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";

export default function BrandVision() {
  const coreValues = [
    {
      title: "Authenticity",
      description: "Stay true, be original, and embrace individuality.",
      icon: "🌎",
      image: "/lovable-uploads/cfefd328-0bcf-4b27-a6c9-fa9c6b1cb3d9.png"
    },
    {
      title: "Innovation",
      description: "Redefine trends, set new standards, and lead the game.",
      icon: "🚀",
      image: "/lovable-uploads/f28aa2dd-8b13-4a67-93fa-878e5fc802e4.png"
    },
    {
      title: "Quality",
      description: "Craft premium streetwear that blends durability with bold design.",
      icon: "🔥",
      image: "/lovable-uploads/ff77a521-3d1d-48f3-a1dc-7aac803f9296.png"
    },
    {
      title: "Community",
      description: "Build a culture where fashion meets passion and connection.",
      icon: "🤝",
      image: "/lovable-uploads/cfefd328-0bcf-4b27-a6c9-fa9c6b1cb3d9.png"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <Cart />
     
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto pt-24 px-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16 text-center"
        >
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-[#1d2951] to-blue-500 text-transparent bg-clip-text">BLUAWAY</h1>
          <h2 className="text-2xl font-light text-[#1d2951]">BRAND VISION</h2>
        </motion.div>
       
        <div className="space-y-8 mb-16">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl leading-relaxed text-gray-700"
          >
            At BLUAWAY, we are not just creating clothes; we are crafting a movement that redefines 
            the boundaries of streetwear. Our vision is to establish BLUAWAY as a global powerhouse in fashion, 
            where every piece tells a story of ambition, authenticity, and fearless creativity.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl leading-relaxed text-gray-700"
          >
            We believe streetwear is more than just fabric—it's an identity, an attitude, and a way of 
            expressing who you are. With an unwavering focus on quality, innovation, and cultural relevance, 
            BLUAWAY aims to inspire a generation that dares to be different, challenges norms, and pushes 
            forward with purpose.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl leading-relaxed text-gray-700"
          >
            Through our flagship streetwear line, BLUAWAY, we introduce designs that blend urban aesthetics 
            with premium craftsmanship, ensuring that every piece stands out while standing the test of time. 
            Our first collection, <span className="font-bold italic text-[#1d2951]">We Grow the Game</span>, 
            embodies our mission to disrupt, evolve, and leave a lasting impact.
          </motion.p>
        </div>
       
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
          className="text-3xl font-bold mb-12 text-[#1d2951]"
        >
          Our Core Values
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {coreValues.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 + 1.2 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200"
            >
              <div className="p-8 h-full flex flex-col">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-[#1d2951] mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 flex-grow">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
       
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-12 p-10 bg-[#1d2951] rounded-2xl shadow-lg text-white"
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            The BLUAWAY Promise
          </h2>
          <div className="space-y-6 text-xl">
            <p>
              We aspire to make BLUAWAY the most influential streetwear brand in Nepal and beyond—one that 
              not only shapes fashion but also fuels self-expression, confidence, and ambition.
            </p>
            <p className="text-2xl font-bold italic">
              BLUAWAY isn't just a brand; it's a statement, a lifestyle, and a revolution in the making.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}