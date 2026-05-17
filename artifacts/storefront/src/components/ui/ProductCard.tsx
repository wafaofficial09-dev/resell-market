import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ShoppingCart, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const [wished, setWished] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;

    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0] || null,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      hasDeliveryCharge: product.hasDeliveryCharge ?? false,
      deliveryCharge: product.deliveryCharge ?? null,
    });

    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWish = (e: React.MouseEvent) => {
    e.preventDefault();
    setWished(w => !w);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted/40 mb-3 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {!product.inStock && (
              <Badge variant="destructive" className="text-[11px] font-bold px-2 py-0.5 shadow-md">
                Sold Out
              </Badge>
            )}
            {product.inStock && product.discountPercent && product.discountPercent > 0 ? (
              <Badge className="bg-secondary text-white border-none shadow-md font-bold text-[11px] px-2 py-0.5">
                {product.discountPercent}% OFF
              </Badge>
            ) : null}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWish}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:scale-110"
            aria-label="Add to wishlist"
          >
            <Heart className={`h-3.5 w-3.5 transition-colors ${wished ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}`} />
          </button>

          {/* Quick Add Button */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              className="w-full shadow-xl bg-white/95 text-foreground hover:bg-primary hover:text-primary-foreground font-semibold backdrop-blur-md text-sm"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.inStock ? "Quick Add" : "Out of Stock"}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="px-1">
          {product.categoryName && (
            <p className="text-[11px] text-muted-foreground mb-1 font-semibold tracking-widest uppercase">
              {product.categoryName}
            </p>
          )}
          <h3 className="font-semibold text-foreground text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base md:text-lg">₹{product.offerPrice?.toLocaleString()}</span>
            {product.price > product.offerPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.price?.toLocaleString()}
              </span>
            )}
          </div>
          {product.hasDeliveryCharge && (
            <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1 font-medium">
              <Truck className="h-3 w-3 shrink-0" />
              +₹{product.deliveryCharge || 50} delivery
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
