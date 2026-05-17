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
import { ShieldCheck, Truck, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormErrors {
  customerName?: string;
  phone?: string;
  address?: string;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getCartTotal, getDeliveryTotal, getGrandTotal, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const deliveryTotal = getDeliveryTotal();
  const cartTotal = getCartTotal();
  const grandTotal = getGrandTotal();

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const validate = (data: typeof formData): FormErrors => {
    const errs: FormErrors = {};
    if (!data.customerName.trim()) {
      errs.customerName = "Full name is required";
    } else if (data.customerName.trim().length < 2) {
      errs.customerName = "Name must be at least 2 characters";
    }
    if (!data.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(data.phone.replace(/\s+/g, ""))) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (!data.address.trim()) {
      errs.address = "Delivery address is required";
    } else if (data.address.trim().length < 10) {
      errs.address = "Please enter a complete address";
    }
    return errs;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validate(formData);
    setErrors(errs);
  };

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (touched[field]) {
      setErrors(validate(updated));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ customerName: true, phone: true, address: true });
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    createOrder.mutate(
      {
        data: {
          customerName: formData.customerName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim() + (formData.notes ? `\n\nNote: ${formData.notes}` : ""),
          paymentMethod,
          total: grandTotal,
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

  const FieldError = ({ error }: { error?: string }) =>
    error ? (
      <p className="text-destructive text-xs flex items-center gap-1 mt-1.5">
        <AlertCircle className="h-3 w-3 shrink-0" />
        {error}
      </p>
    ) : null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />

      <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-display font-bold mb-8 text-center md:text-left"
        >
          Checkout
        </motion.h1>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Shipping Details */}
            <Card className="glass-card border-white/30 shadow-xl shadow-primary/5">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-xl font-display font-bold">Shipping Details</h2>
                <p className="text-sm text-muted-foreground -mt-1">Fields marked with * are required</p>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Rahul Sharma"
                    value={formData.customerName}
                    onChange={e => handleChange("customerName", e.target.value)}
                    onBlur={() => handleBlur("customerName")}
                    className={cn(
                      "h-12 rounded-xl transition-colors",
                      touched.customerName && errors.customerName
                        ? "border-destructive ring-1 ring-destructive/20 focus-visible:ring-destructive/30"
                        : "focus-visible:ring-primary/30"
                    )}
                    data-testid="input-name"
                  />
                  <FieldError error={touched.customerName ? errors.customerName : undefined} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-semibold">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium select-none">+91</span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="98765 43210"
                      value={formData.phone}
                      onChange={e => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onBlur={() => handleBlur("phone")}
                      className={cn(
                        "h-12 rounded-xl pl-11 transition-colors",
                        touched.phone && errors.phone
                          ? "border-destructive ring-1 ring-destructive/20"
                          : "focus-visible:ring-primary/30"
                      )}
                      data-testid="input-phone"
                    />
                  </div>
                  <FieldError error={touched.phone ? errors.phone : undefined} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-semibold">
                    Delivery Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="House/Flat No, Street, Locality, City, State, Pincode"
                    value={formData.address}
                    onChange={e => handleChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    className={cn(
                      "min-h-[90px] rounded-xl resize-none transition-colors",
                      touched.address && errors.address
                        ? "border-destructive ring-1 ring-destructive/20"
                        : "focus-visible:ring-primary/30"
                    )}
                    data-testid="input-address"
                  />
                  <FieldError error={touched.address ? errors.address : undefined} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
                    Order Notes <span className="text-xs">(Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for your order..."
                    value={formData.notes}
                    onChange={e => handleChange("notes", e.target.value)}
                    className="min-h-[60px] rounded-xl resize-none text-sm focus-visible:ring-primary/30"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="glass-card border-white/30 shadow-xl shadow-primary/5">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-display font-bold">Payment Method</h2>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <Label
                    htmlFor="cod"
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200",
                      paymentMethod === "cod"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "hover:bg-muted/40 hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <div>
                        <p className="font-semibold text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Pay when you receive your order</p>
                      </div>
                    </div>
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </Label>

                  <Label
                    htmlFor="online"
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200",
                      paymentMethod === "online"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                        : "hover:bg-muted/40 hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="online" id="online" />
                      <div>
                        <p className="font-semibold text-sm">Pay Online</p>
                        <p className="text-xs text-muted-foreground mt-0.5">UPI, Debit/Credit Card, Netbanking</p>
                      </div>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all"
              disabled={createOrder.isPending}
              data-testid="button-place-order"
            >
              {createOrder.isPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing Order...</>
              ) : (
                `Place Order • ₹${grandTotal}`
              )}
            </Button>
          </motion.form>

          {/* Order Summary */}
          <motion.div
            className="lg:sticky top-24"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card border-white/30 shadow-2xl shadow-primary/10">
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-bold mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 max-h-[45vh] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3 items-start">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                        {item.hasDeliveryCharge && (
                          <p className="text-xs text-amber-600 mt-0.5">+₹{item.deliveryCharge || 50} delivery</p>
                        )}
                      </div>
                      <div className="font-semibold text-sm shrink-0">
                        ₹{item.offerPrice * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border/60 mb-4" />

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  {deliveryTotal > 0 ? (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Delivery</span>
                      <span>₹{deliveryTotal}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  )}
                  <div className="h-px bg-border/60 my-1" />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span className="gradient-text">₹{grandTotal}</span>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200/50 dark:border-green-800/30">
                  <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    100% secure & trusted checkout
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
