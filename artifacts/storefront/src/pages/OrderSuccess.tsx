import { useLocation } from "wouter";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-display font-bold mb-4">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Thank you for shopping with us. We've received your order and will process it shortly.
            </p>
            
            {orderId && (
              <div className="bg-muted p-4 rounded-2xl mb-8 border border-border">
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                <p className="text-xl font-mono font-bold tracking-wider">{orderId}</p>
              </div>
            )}

            <Button asChild size="lg" className="w-full rounded-full h-14 text-lg">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
