import { motion } from "framer-motion";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Info, ArrowRight, Shirt, User, Check } from "lucide-react";

const categories = [
  {
    name: "T-Shirts",
    description: "Our t-shirts are designed for a comfortable, modern fit. Please check the measurements to find your perfect size.",
    measurements: [
      { size: "M", Width: "42", length: "25.5", shoulder: "19", sleeve: "8.5" },
      { size: "L", Width: "44", length: "26.5", shoulder: "19.5", sleeve: "8.75" },
      { size: "XL", Width: "46", length:"27.5", shoulder: "20", sleeve: "9" },
    ]
  },
  {
    name: "Zip UP",
    description: "Zip Up feature a relaxed fit with room for layering. Size up if you prefer an oversized look.",
    measurements:[
      { size: "M", Width: "45", length: "23.5", shoulder: "20", sleeve: "24" },
      { size: "L", Width: "47", length: "24.5", shoulder: "20", sleeve: "25" },
      { size: "XL", Width: "47", length:"25.5", shoulder: "20", sleeve: "26.5" },
    ]
  },
  {
    name: "Wind Breaker",
    description: "Our jackets are true to size with a contemporary cut. For a looser fit, we recommend going up one size.",
    measurements: [
      { size: "M", Width: "48", length: "27", shoulder: "23", sleeve: "22" },
      { size: "L", Width: "50", length: "28", shoulder: "24", sleeve: "23" },
      { size: "XL", Width: "50", length:"29", shoulder: "24", sleeve: "24" },
    ]
  },
  {
    name: "Sweat Pants",
    description: "Pants are designed with a modern fit. Please use the measurements to ensure the best fit for your body type.",
    measurements: [
      { size: "M",  length: "38", Waist: "29.5", Bottom: "19.5" },
      { size: "L",  length: "39", Waist: "30.5", Bottom: "19.5" },
      { size: "XL", length:"40", Waist: "31", Bottom: "20" },
    ]
  }
];

const measurementGuide = {
  Width: "Measure around the fullest part of your Width, keeping the tape horizontal.",
  length: "Measure from the highest point of the shoulder to the bottom hem.",
  shoulder: "Measure from the edge of one shoulder straight across to the other edge.",
  sleeve: "Measure from the shoulder seam to the end of the sleeve.",
  waist: "Measure around your natural waistline, keeping the tape comfortably loose.",
  Bottom: "Measure from the crotch to the bottom of the leg."
};

export default function SizeGuide() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [selectedSize, setSelectedSize] = useState("M");
  const [showTips, setShowTips] = useState(false);

  const currentCategory = categories.find(cat => cat.name === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Cart />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 pb-16"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light mb-3 text-gray-800">SIZE GUIDE</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Find your perfect fit with our detailed size guide. All measurements are in Inch.</p>
        </motion.div>
        
        <Tabs defaultValue={categories[0].name} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm p-2">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.name}
                  value={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSelectedSize(category.measurements[0].size);
                  }}
                  className="py-3 rounded-lg"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.name} value={category.name} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">{category.name}</h2>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <Ruler className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">Inch</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-500 mb-2">SELECT SIZE</div>
                    <div className="flex flex-wrap gap-2">
                      {category.measurements.map((item) => (
                        <motion.button
                          key={item.size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(item.size)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedSize === item.size
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {item.size}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="overflow-hidden mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(category.measurements[0])
                            .filter(key => key !== 'size')
                            .map(key => (
                              <th key={key} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {category.measurements
                          .filter(item => item.size === selectedSize)
                          .map((item) => (
                            <tr key={item.size}>
                              {Object.entries(item)
                                .filter(([key]) => key !== 'size')
                                .map(([key, value]) => (
                                  <td key={key} className="px-3 py-4 text-sm font-medium text-gray-800">
                                    {value}
                                  </td>
                                ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <User className="h-5 w-5 text-blue-500" />
                    <span>This size fits a typical {selectedSize}-sized individual</span>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    <span>How to Measure</span>
                  </h3>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTips(!showTips)}
                    className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left mb-4"
                  >
                    <div className="flex items-center">
                      <Ruler className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium text-gray-700">Measuring Tips</span>
                    </div>
                    <ArrowRight className={`h-4 w-4 text-gray-500 transition-transform ${showTips ? 'rotate-90' : ''}`} />
                  </motion.button>
                  
                  {showTips && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-blue-50 rounded-lg mb-4"
                    >
                      <ul className="space-y-3">
                        {Object.entries(measurementGuide)
                          .filter(([key]) => {
                            if (category.name === "Sweat Pants") {
                              return ["waist", "Bottom", "length", "inseam"].includes(key);
                            }
                            return ["Width", "length", "shoulder", "sleeve"].includes(key);
                          })
                          .map(([key, description]) => (
                            <li key={key} className="flex text-sm">
                              <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span><strong className="text-blue-700">{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {description}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </motion.div>
                  )}
                  
                  <div className="bg-white">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Shirt className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Complete Size Chart</span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Size
                            </th>
                            {Object.keys(category.measurements[0])
                              .filter(key => key !== 'size')
                              .map(key => (
                                <th key={key} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {key}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {category.measurements.map((item) => (
                            <tr 
                              key={item.size}
                              className={selectedSize === item.size ? "bg-blue-50" : ""}
                            >
                              <td className="px-3 py-3 text-sm font-medium text-gray-800">
                                {item.size}
                              </td>
                              {Object.entries(item)
                                .filter(([key]) => key !== 'size')
                                .map(([key, value]) => (
                                  <td key={key} className="px-3 py-3 text-sm text-gray-500">
                                    {value}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Size Guide Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>All measurements are in centimeters</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>For the best fit, we recommend having someone else take your measurements</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Keep the measuring tape snug but not tight</span>
              </li>
            </ul>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>If you're between sizes, we recommend going up a size</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>Please note that different styles may fit differently</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>If you have any questions, please contact our customer service</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
