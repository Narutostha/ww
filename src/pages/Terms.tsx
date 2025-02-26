import { motion } from "framer-motion";
import { ArrowRight, Book, FileCheck, RefreshCcw, AlertTriangle, Shield, FileText, Mail, Phone } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";

export default function Terms() {
  const sections = [
    {
      title: "Order Cancellations",
      icon: <FileCheck className="w-6 h-6" />,
      content: `Cancellations are accepted only if the request is made before the order is dispatched.`,
      color: "bg-gradient-to-r from-amber-50 to-amber-100",
      iconBg: "bg-amber-400"
    },
    {
      title: "Returns and Exchanges",
      icon: <RefreshCcw className="w-6 h-6" />,
      content: `• We accept returns or exchanges if the product is unused and resalable within 3 days of purchase.
• A purchase invoice is required to process your request.
• Inform us at bluawayclo@gmail.com with your contact information. We will reach out to you to proceed.
• Customers are responsible for delivery/pickup charges for returns and exchanges.`,
      color: "bg-gradient-to-r from-blue-50 to-blue-100",
      iconBg: "bg-blue-400"
    },
    {
      title: "Damaged or Defective Items",
      icon: <AlertTriangle className="w-6 h-6" />,
      content: `• Damaged goods caused by the customer cannot be returned.
• Defective or damaged items can be replaced with the same item, subject to availability.`,
      color: "bg-gradient-to-r from-red-50 to-red-100",
      iconBg: "bg-red-400"
    },
    {
      title: "Exchange Process",
      icon: <RefreshCcw className="w-6 h-6" />,
      content: `• Exchange are available within 3 days of purchase.
• Products purchased from online will be exchanged through online process and physical store will be exchanged within the respective store only.`,
      color: "bg-gradient-to-r from-green-50 to-green-100",
      iconBg: "bg-green-400"
    },
    {
      title: "Inspection and Approval",
      icon: <FileCheck className="w-6 h-6" />,
      content: `• Returned items will be inspected upon receipt.
• Customers will be notified via email or call regarding the approval or rejection of the exchange.`,
      color: "bg-gradient-to-r from-indigo-50 to-indigo-100",
      iconBg: "bg-indigo-400"
    },
    {
      title: "Availability",
      icon: <AlertTriangle className="w-6 h-6" />,
      content: `Replacements depend on stock availability. Please do not send products back without prior approval.`,
      color: "bg-gradient-to-r from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-400"
    },
    {
      title: "License",
      icon: <Book className="w-6 h-6" />,
      content: `Unless otherwise stated, we and/or our licensors own the intellectual property rights for all material on our Website. All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use subject to restrictions set in these terms and conditions.`,
      color: "bg-gradient-to-r from-purple-50 to-purple-100",
      iconBg: "bg-purple-400"
    },
    {
      title: "Restrictions",
      icon: <AlertTriangle className="w-6 h-6" />,
      content: `You are specifically restricted from all of the following:
• publishing any website material in any media;
• selling, sublicensing and/or otherwise commercializing any website material;
• publicly performing and/or showing any website material;
• using this website in any way that is, or may be, damaging to this website;
• using this website in any way that impacts user access to this website;`,
      color: "bg-gradient-to-r from-pink-50 to-pink-100",
      iconBg: "bg-pink-400"
    },
    {
      title: "Your Privacy",
      icon: <Shield className="w-6 h-6" />,
      content: `Please read our Privacy Policy for details about how we collect, use, and protect your personal information.`,
      color: "bg-gradient-to-r from-teal-50 to-teal-100",
      iconBg: "bg-teal-400"
    },
    {
      title: "Disclaimer",
      icon: <FileText className="w-6 h-6" />,
      content: `To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill).`,
      color: "bg-gradient-to-r from-gray-50 to-gray-100",
      iconBg: "bg-gray-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Sidebar />
      <Cart />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto pt-28 px-6 pb-20"
      >
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl font-thin mb-4 text-gray-800 tracking-wide"
          >
            TERMS & CONDITIONS
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto"
          />
        </div>
        
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              variants={{
                hidden: { y: 20, opacity: 0 },
                show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
              }}
              className={`${section.color} rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`${section.iconBg} text-white p-2 rounded-lg mr-3`}>
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-medium text-gray-700">
                    {index + 1}. {section.title}
                  </h2>
                </div>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mt-16 bg-white rounded-xl shadow-md p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              Last updated: February 12, 2025
            </p>
            
            <div className="flex flex-col items-center md:items-end">
              <p className="text-base font-medium text-gray-700 mb-3">Need assistance? Contact us:</p>
              <div className="flex space-x-4">
                <a href="mailto:bluawayclo@gmail.com" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>bluawayclo@gmail.com</span>
                </a>
                <a href="tel:9802352253 " className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>+977 9802352253 </span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}