import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, getCartTotal } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Button size="lg" asChild className="rounded-full">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden glass-card">
                      <CardContent className="p-4 flex gap-4 sm:gap-6 items-center">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-2">{item.name}</h3>
                              <p className="text-muted-foreground font-medium mt-1">₹{item.offerPrice}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center border rounded-full p-1 bg-background/50">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-bold text-lg">₹{item.offerPrice * item.quantity}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 sticky top-24">
              <Card className="glass-card">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-display font-semibold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="h-px bg-border my-4" />
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span>₹{getCartTotal()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90"
                    onClick={() => setLocation("/checkout")}
                  >
                    Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
