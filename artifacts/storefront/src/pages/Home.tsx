import { useGetSettings, useListProducts, useListCategories, useListBanners } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const { data: settings } = useGetSettings();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useListProducts({ featured: true });
  const { data: recentProducts, isLoading: isLoadingRecent } = useListProducts();
  const { data: banners } = useListBanners();

  const activeBanners = banners?.filter(b => b.active) || [];

  return (
    <div className="min-h-screen flex flex-col">
      {settings?.announcementEnabled && settings.announcementText && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-sm font-medium">
          <p className="animate-pulse">{settings.announcementText}</p>
        </div>
      )}
      
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="relative rounded-3xl overflow-hidden bg-muted aspect-[4/3] md:aspect-[21/9] lg:aspect-[3/1] flex items-center justify-center">
            {activeBanners.length > 0 ? (
              <img src={activeBanners[0].imageUrl} alt="Banner" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
            )}
            
            <div className="relative z-10 text-center px-4 max-w-3xl glass-card rounded-2xl p-8 md:p-12 mx-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4"
              >
                {settings?.heroTitle || "Curated Premium Finds."}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-muted-foreground mb-8"
              >
                {settings?.heroSubtitle || "Discover exclusive items handpicked for you. Fast shipping, guaranteed quality."}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25" asChild>
                  <Link href="/products">Shop Collection</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold">Shop by Category</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingCategories ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)
            ) : (
              categories?.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/products?category=${category.id}`} className="block group">
                    <div className="aspect-square rounded-2xl bg-muted flex flex-col items-center justify-center p-4 hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20">
                      <span className="text-3xl mb-2">{category.icon || '🛍️'}</span>
                      <span className="font-medium text-center">{category.name}</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold">Featured Deals</h2>
            <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" asChild>
              <Link href="/products?featured=true">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingFeatured ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
            ) : (
              featuredProducts?.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            )}
          </div>
        </section>

        {/* Recent Arrivals */}
        <section className="container mx-auto px-4 md:px-6 mb-20 bg-accent rounded-3xl p-8 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold">New Arrivals</h2>
            <Button variant="outline" className="rounded-full bg-white/50 backdrop-blur-sm" asChild>
              <Link href="/products">
                Shop All
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingRecent ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
            ) : (
              recentProducts?.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating WhatsApp Button */}
      {settings?.whatsappNumber && (
        <a 
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center group"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute right-full mr-4 bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Need help? Chat with us!
          </span>
        </a>
      )}
    </div>
  );
}
