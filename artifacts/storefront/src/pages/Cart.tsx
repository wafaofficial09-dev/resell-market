import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items, removeItem, updateQuantity, getCartTotal, getDeliveryTotal, getGrandTotal } = useCart();
  const deliveryTotal = getDeliveryTotal();
  const cartTotal = getCartTotal();
  const grandTotal = getGrandTotal();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20"
          >
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Button size="lg" asChild className="rounded-full px-8">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="overflow-hidden glass-card border-white/30">
                      <CardContent className="p-4 flex gap-4 sm:gap-5 items-start">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 shadow-md">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-base line-clamp-2 leading-snug">{item.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-primary font-bold">₹{item.offerPrice}</span>
                                {item.hasDeliveryCharge && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300 bg-amber-50">
                                    <Truck className="h-2.5 w-2.5 mr-1" />
                                    +₹{item.deliveryCharge || 50} delivery
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8"
                              onClick={() => removeItem(item.productId)}
                              data-testid={`button-remove-${item.productId}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center border rounded-full p-0.5 bg-background/60 shadow-sm">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                data-testid={`button-decrease-${item.productId}`}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                data-testid={`button-increase-${item.productId}`}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="font-bold text-base">₹{item.offerPrice * item.quantity}</span>
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
              <Card className="glass-card shadow-2xl shadow-primary/10 border-white/30">
                <CardContent className="p-6 md:p-7">
                  <h2 className="text-xl font-display font-bold mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    {deliveryTotal > 0 ? (
                      <div className="flex justify-between text-sm text-amber-600">
                        <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery charges</span>
                        <span>₹{deliveryTotal}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground"><Truck className="h-3.5 w-3.5" /> Delivery</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                    )}
                    <div className="h-px bg-border/60 my-2" />
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="gradient-text">₹{grandTotal}</span>
                    </div>
                  </div>

                  {deliveryTotal > 0 && (
                    <p className="text-xs text-muted-foreground mb-4 flex items-start gap-1.5">
                      <Truck className="h-3 w-3 shrink-0 mt-0.5" />
                      Delivery charges applied for selected products
                    </p>
                  )}

                  <Button
                    size="lg"
                    className="w-full rounded-full h-13 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    onClick={() => setLocation("/checkout")}
                    data-testid="button-checkout"
                  >
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button variant="ghost" className="w-full mt-3 text-muted-foreground text-sm" asChild>
                    <Link href="/products">Continue Shopping</Link>
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
