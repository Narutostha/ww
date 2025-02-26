import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Cart from "../components/Cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
  };

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
        <h1 className="text-4xl font-light mb-12 text-[#868686]">CONTACT US</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6 text-[#868686]">
            <div>
              <h2 className="text-xl font-medium mb-2">Location</h2>
              <p>123 Fashion Street</p>
              <p>London, UK</p>
              <p>EC1A 1BB</p>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-2">Contact</h2>
              <p>Email: info@example.com</p>
              <p>Phone: +44 20 1234 5678</p>
            </div>
            
            <div>
              <h2 className="text-xl font-medium mb-2">Hours</h2>
              <p>Monday - Friday: 9am - 6pm</p>
              <p>Saturday: 10am - 4pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input 
                  placeholder="Name" 
                  required 
                  className="bg-white border-[#868686]"
                />
              </div>
              
              <div>
                <Input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  className="bg-white border-[#868686]"
                />
              </div>
              
              <div>
                <Input 
                  placeholder="Subject" 
                  required 
                  className="bg-white border-[#868686]"
                />
              </div>
              
              <div>
                <Textarea 
                  placeholder="Message" 
                  required 
                  className="bg-white border-[#868686] min-h-[150px]"
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-[#868686] hover:bg-[#666666]"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}