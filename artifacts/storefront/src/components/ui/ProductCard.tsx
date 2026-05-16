import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

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
    });
    
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/products/${product.id}`} className="block group">
        <Card className="overflow-hidden border-transparent bg-transparent hover:glass-card transition-all duration-300">
          <CardContent className="p-0">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted/50 rounded-2xl mb-3">
              {product.images[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground text-sm">No image</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {!product.inStock && (
                  <Badge variant="destructive" className="font-semibold shadow-md">Sold Out</Badge>
                )}
                {product.inStock && product.discountPercent && product.discountPercent > 0 ? (
                  <Badge className="bg-secondary text-white border-none shadow-md font-semibold">
                    {product.discountPercent}% OFF
                  </Badge>
                ) : null}
              </div>

              {/* Quick Add Button */}
              <div className="absolute bottom-3 left-3 right-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <Button 
                  className="w-full shadow-lg backdrop-blur-md bg-white/90 text-primary hover:bg-primary hover:text-white" 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.inStock ? "Quick Add" : "Out of Stock"}
                </Button>
              </div>
            </div>
            
            <div className="px-2 pb-2">
              {product.categoryName && (
                <p className="text-xs text-muted-foreground mb-1 font-medium tracking-wide uppercase">
                  {product.categoryName}
                </p>
              )}
              <h3 className="font-display font-semibold text-foreground text-lg mb-1 truncate group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">₹{product.offerPrice}</span>
                {product.price > product.offerPrice && (
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                    ₹{product.price}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
