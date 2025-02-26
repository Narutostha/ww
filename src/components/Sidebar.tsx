import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuItems = [
    { label: "PRODUCTS", path: "/products" },
    { label: "SIZE GUIDE", path: "/size-guide" },
    { label: "BRAND VISION", path: "/brandvision  " },
    { label: "FOUNDATION", path: "/foundation" },
    { label: "TERMS", path: "/terms" },
    { label: "SHIPPING PRICES", path: "/shipping-prices" }
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[60] md:hidden p-2 bg-white rounded-md"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-[#868686]" />
        ) : (
          <Menu className="h-5 w-5 text-[#868686]" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div 
        className={`fixed left-0 top-0 h-full w-40 bg-white md:bg-transparent z-50 
                   transform transition-transform duration-300 ease-in-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-4 flex justify-center">
          <Link 
            to="/" 
            className="block"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/BluAway.svg"
              alt="Logo"
              className="w-26 h-26 object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Menu Items */}
        <div className="mt-12 pl-4">
          <nav className="space-y-6">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="block text-[#868686] text-left no-underline uppercase text-sm font-bold 
                         tracking-wider cursor-pointer
                         transition-colors duration-200
                         hover:text-yellow-400"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;