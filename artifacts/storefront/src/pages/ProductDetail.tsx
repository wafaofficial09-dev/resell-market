import { useState } from "react";
import { useGetProduct, useGetSettings } from "@workspace/api-client-react";
import { useRoute, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ShoppingCart, MessageCircle, ChevronLeft, Minus, Plus, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ? parseInt(params.id) : 0;
  
  const { data: product, isLoading } = useGetProduct(productId, { 
    query: { enabled: !!productId } 
  });
  
  const { data: settings } = useGetSettings();
  const addItem = useCart(state => state.addItem);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild><Link href="/products">Back to Shop</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const currentImage = selectedImage || product.images[0];

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0] || null,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity,
      hasDeliveryCharge: product.hasDeliveryCharge ?? false,
      deliveryCharge: product.deliveryCharge ?? null,
    });
    toast.success("Added to cart", {
      description: `${quantity}x ${product.name} has been added to your cart.`,
    });
  };

  const whatsappMessage = encodeURIComponent(`Hi, I'm interested in this product: ${product.name}\nPrice: ₹${product.offerPrice}\nLink: ${window.location.href}`);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/products" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to products
          </Link>
          
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Image Gallery */}
            <div className="space-y-4 sticky top-24">
              <div className="aspect-square rounded-3xl overflow-hidden bg-muted/30 border">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImage}
                    src={currentImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
                
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white text-3xl font-display font-bold transform -rotate-12">SOLD OUT</span>
                  </div>
                )}
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${currentImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {product.categoryName && (
                <span className="text-primary font-semibold tracking-wider text-sm uppercase mb-2">
                  {product.categoryName}
                </span>
              )}
              
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold">₹{product.offerPrice}</span>
                {product.price > product.offerPrice && (
                  <span className="text-xl text-muted-foreground line-through">₹{product.price}</span>
                )}
                {product.discountPercent && product.discountPercent > 0 ? (
                  <Badge className="bg-secondary text-white border-none ml-2">
                    {product.discountPercent}% OFF
                  </Badge>
                ) : null}
              </div>

              {product.hasDeliveryCharge && (
                <div className="flex items-center gap-2 mb-4 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-2.5 w-fit">
                  <Truck className="h-4 w-4 shrink-0" />
                  <span>Delivery charge: <strong>₹{product.deliveryCharge || 50}</strong></span>
                </div>
              )}

              <div className="prose prose-gray dark:prose-invert max-w-none mb-8 text-muted-foreground text-lg">
                {product.description || "No description available."}
              </div>
              
              <div className="h-px bg-border mb-8 w-full" />

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-full p-1 bg-background">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!product.inStock}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!product.inStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <span className="text-sm font-medium">
                    {product.inStock 
                      ? product.stockCount !== null ? `${product.stockCount} in stock` : "In stock" 
                      : <span className="text-destructive">Out of stock</span>}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    size="lg" 
                    className="flex-1 rounded-full text-lg h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.inStock ? "Add to Cart" : "Sold Out"}
                  </Button>
                  
                  {settings?.whatsappNumber && (
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="flex-1 rounded-full text-lg h-14 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
                      asChild
                    >
                      <a href={`https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`} target="_blank" rel="noreferrer">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Inquire
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
