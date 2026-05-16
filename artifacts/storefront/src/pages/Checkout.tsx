import { useState } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ShieldCheck, Truck, Loader2 } from "lucide-react";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getCartTotal, clearCart } = useCart();
  const createOrder = useCreateOrder();
  
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) {
      toast.error("Please fill in all fields");
      return;
    }

    createOrder.mutate(
      {
        data: {
          customerName: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          paymentMethod,
          total: getCartTotal(),
          items: items.map(item => ({
            productId: item.productId,
            productName: item.name,
            productImage: item.image,
            price: item.price,
            offerPrice: item.offerPrice,
            quantity: item.quantity
          }))
        }
      },
      {
        onSuccess: (data) => {
          clearCart();
          setLocation(`/order-success?orderId=${data.orderId}`);
        },
        onError: () => {
          toast.error("Failed to place order. Please try again.");
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-5xl font-display font-bold mb-8 text-center md:text-left">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="glass-card">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-display font-semibold mb-4">Shipping Details</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Jane Doe" 
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                      required
                      className="bg-background/50 h-12 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      required
                      className="bg-background/50 h-12 rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Delivery Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="House/Flat No, Street, City, State, Pincode" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      required
                      className="bg-background/50 min-h-[100px] rounded-xl resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 md:p-8 space-y-6">
                <h2 className="text-2xl font-display font-semibold mb-4">Payment Method</h2>
                
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <Label 
                    htmlFor="cod" 
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">Cash on Delivery</span>
                        <span className="text-sm text-muted-foreground">Pay when you receive</span>
                      </div>
                    </div>
                    <Truck className="h-6 w-6 text-muted-foreground" />
                  </Label>
                  
                  <Label 
                    htmlFor="online" 
                    className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-muted/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="online" id="online" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">Pay Online</span>
                        <span className="text-sm text-muted-foreground">UPI, Cards, Netbanking</span>
                      </div>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing Order...</>
              ) : (
                `Place Order • ₹${getCartTotal()}`
              )}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1 sticky top-24">
            <Card className="glass-card border-none bg-background/40 backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold">
                        ₹{item.offerPrice * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="h-px bg-border my-4" />
                
                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-4 border-t">
                    <span>Total</span>
                    <span>₹{getCartTotal()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
