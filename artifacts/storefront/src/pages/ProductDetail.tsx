import { useState } from "react";
import { useGetProduct, useGetSettings, useListProducts } from "@workspace/api-client-react";
import { useRoute, Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/ui/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import {
  ShoppingCart, MessageCircle, ChevronLeft, Minus, Plus,
  Truck, ShieldCheck, RotateCcw, Zap, Star, Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId },
  });

  const { data: settings } = useGetSettings();
  const addItem = useCart((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: allProducts } = useListProducts();
  const relatedProducts = allProducts
    ?.filter(
      (p) =>
        p.id !== productId &&
        p.categoryId === product?.categoryId &&
        p.inStock
    )
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-[4/3] rounded-3xl" />
            <div className="space-y-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
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
          <Button asChild>
            <Link href="/products">Back to Shop</Link>
          </Button>
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
      description: `${quantity}× ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
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
    setLocation("/checkout");
  };

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in: ${product.name}\nPrice: ₹${product.offerPrice}\nLink: ${window.location.href}`
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4 md:px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
            {product.categoryName && (
              <>
                <span>/</span>
                <Link href={`/products?category=${product.categoryId}`} className="hover:text-primary transition-colors">
                  {product.categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
          </div>

          {/* Main grid */}
          <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[55%_1fr] gap-8 lg:gap-12 items-start">

            {/* ── Image Gallery ── */}
            <div className="space-y-3 sticky top-24">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted/30 border border-border/50">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </AnimatePresence>

                {/* Discount badge on image */}
                {product.inStock && product.discountPercent && product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-secondary text-white border-none font-bold shadow-md text-xs">
                      {product.discountPercent}% OFF
                    </Badge>
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="text-white text-2xl font-display font-bold -rotate-12 tracking-widest">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        currentImage === img
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col gap-0 py-1">

              {/* Category + rating row */}
              <div className="flex items-center justify-between mb-3">
                {product.categoryName && (
                  <Link
                    href={`/products?category=${product.categoryId}`}
                    className="text-primary font-semibold tracking-widest text-[11px] uppercase hover:underline"
                  >
                    {product.categoryName}
                  </Link>
                )}
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`h-3 w-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                  ))}
                  <span className="text-[11px] text-muted-foreground ml-1">(24)</span>
                </div>
              </div>

              {/* Title — compact and elegant */}
              <h1 className="text-lg md:text-xl font-bold leading-tight mb-3 text-foreground">
                {product.name}
              </h1>

              {/* Price row */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-foreground">
                  ₹{product.offerPrice?.toLocaleString()}
                </span>
                {product.price > product.offerPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.price?.toLocaleString()}
                  </span>
                )}
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Save ₹{(product.price - product.offerPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Delivery notice */}
              {product.hasDeliveryCharge ? (
                <div className="flex items-center gap-2 mb-4 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/30 rounded-xl px-3 py-2 w-fit">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span>+₹{product.deliveryCharge || 50} delivery charge applies</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30 rounded-xl px-3 py-2 w-fit">
                  <Truck className="h-3.5 w-3.5 shrink-0" />
                  <span>Free delivery on this item</span>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {product.description || "No description available."}
              </p>

              <div className="h-px bg-border/60 mb-5" />

              {/* Quantity + stock */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center border border-border rounded-full p-0.5 bg-background/80">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.inStock}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {product.inStock
                    ? product.stockCount !== null
                      ? `${product.stockCount} units left`
                      : "In stock"
                    : <span className="text-destructive font-semibold">Out of stock</span>}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2.5 mb-6">
                <Button
                  size="default"
                  className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>

                <Button
                  size="default"
                  variant="outline"
                  className="w-full rounded-full h-11 border-primary/30 text-primary hover:bg-primary/5 font-semibold"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.inStock ? "Add to Cart" : "Sold Out"}
                </Button>

                {settings?.whatsappNumber && (
                  <Button
                    size="default"
                    variant="ghost"
                    className="w-full rounded-full h-10 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] text-sm"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Inquire on WhatsApp
                    </a>
                  </Button>
                )}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-2xl border border-border/40">
                {[
                  { icon: ShieldCheck, label: "100% Genuine", sub: "Verified products" },
                  { icon: RotateCcw, label: "7-Day Returns", sub: "Hassle-free" },
                  { icon: Package, label: "Fast Delivery", sub: "2–5 working days" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex flex-col items-center text-center gap-1 py-1">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-semibold text-foreground leading-tight">{label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts && relatedProducts.length > 0 && (
            <section className="mt-16 pt-10 border-t border-border/40">
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-lg md:text-xl font-bold">You May Also Like</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    More from {product.categoryName}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary text-xs rounded-full" asChild>
                  <Link href={`/products?category=${product.categoryId}`}>
                    View all →
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
