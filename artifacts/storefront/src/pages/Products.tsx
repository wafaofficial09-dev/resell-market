import { useState } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";

export default function Products() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialCategory = searchParams.get("category");
  const initialFeatured = searchParams.get("featured") === "true";
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  const { data: products, isLoading: isLoadingProducts } = useListProducts({
    search: search || undefined,
    category: selectedCategory || undefined,
    featured: initialFeatured || undefined
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">
              {initialFeatured ? "Featured Deals" : "All Products"}
            </h1>
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-10 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Categories Scrollable Row */}
              <div className="w-full md:w-auto overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-none">
                <div className="flex gap-2 min-w-max">
                  <Button 
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </Button>
                  {isLoadingCategories ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full" />)
                  ) : (
                    categories?.map(c => (
                      <Button
                        key={c.id}
                        variant={selectedCategory === c.id.toString() ? "default" : "outline"}
                        className="rounded-full"
                        onClick={() => setSelectedCategory(c.id.toString())}
                      >
                        {c.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {isLoadingProducts ? (
              Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
            ) : products?.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-xl text-muted-foreground">No products found.</p>
              </div>
            ) : (
              products?.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
