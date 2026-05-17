import { useState, useEffect, useCallback } from "react";
import { useGetSettings, useListProducts, useListCategories, useListBanners } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ui/ProductCard";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, MessageCircle, ChevronLeft, ChevronRight, Sparkles, Star,
  Trophy, Zap, Home as LucideHome, Shirt, ShoppingBag, Gem, Heart, Watch, BookOpen,
  Dumbbell, Camera, Music, Car, Baby, Coffee, Pizza, Palette, Laptop,
  Headphones, Smartphone, Tv, Package, Tag, type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  Trophy, Zap, Home: LucideHome, Shirt, ShoppingBag, Gem, Heart, Watch, BookOpen,
  Dumbbell, Camera, Music, Car, Baby, Coffee, Pizza, Palette, Laptop,
  Headphones, Smartphone, Tv, Package, Tag, Star, Sparkles,
};

function CategoryIcon({ name }: { name?: string | null }) {
  if (!name) return <ShoppingBag className="h-8 w-8" />;
  const Icon = LUCIDE_ICON_MAP[name];
  if (Icon) return <Icon className="h-8 w-8" />;
  if (name.length <= 4) return <span className="text-4xl leading-none">{name}</span>;
  return <ShoppingBag className="h-8 w-8" />;
}

const CATEGORY_GRADIENTS = [
  "from-violet-500/80 to-purple-700/80",
  "from-blue-500/80 to-cyan-600/80",
  "from-rose-500/80 to-pink-700/80",
  "from-amber-500/80 to-orange-600/80",
  "from-emerald-500/80 to-teal-700/80",
  "from-indigo-500/80 to-blue-700/80",
  "from-fuchsia-500/80 to-pink-600/80",
  "from-red-500/80 to-rose-700/80",
];

const CATEGORY_BG = [
  "bg-violet-100 dark:bg-violet-950/40",
  "bg-blue-100 dark:bg-blue-950/40",
  "bg-rose-100 dark:bg-rose-950/40",
  "bg-amber-100 dark:bg-amber-950/40",
  "bg-emerald-100 dark:bg-emerald-950/40",
  "bg-indigo-100 dark:bg-indigo-950/40",
  "bg-fuchsia-100 dark:bg-fuchsia-950/40",
  "bg-red-100 dark:bg-red-950/40",
];

const CATEGORY_TEXT = [
  "text-violet-700 dark:text-violet-300",
  "text-blue-700 dark:text-blue-300",
  "text-rose-700 dark:text-rose-300",
  "text-amber-700 dark:text-amber-300",
  "text-emerald-700 dark:text-emerald-300",
  "text-indigo-700 dark:text-indigo-300",
  "text-fuchsia-700 dark:text-fuchsia-300",
  "text-red-700 dark:text-red-300",
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: settings } = useGetSettings();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useListProducts({ featured: true });
  const { data: recentProducts, isLoading: isLoadingRecent } = useListProducts();
  const { data: banners } = useListBanners();

  const activeBanners = banners?.filter(b => b.active) || [];
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextBanner = useCallback(() => {
    if (activeBanners.length > 1) {
      setCurrentBanner(prev => (prev + 1) % activeBanners.length);
    }
  }, [activeBanners.length]);

  const prevBanner = useCallback(() => {
    if (activeBanners.length > 1) {
      setCurrentBanner(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
    }
  }, [activeBanners.length]);

  useEffect(() => {
    if (!isAutoPlaying || activeBanners.length <= 1) return;
    const timer = setInterval(nextBanner, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextBanner, activeBanners.length]);

  const handleBannerClick = (banner: typeof activeBanners[0]) => {
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith("http")) {
        window.open(banner.linkUrl, "_blank");
      } else {
        setLocation(banner.linkUrl);
      }
    }
  };

  const banner = activeBanners[currentBanner];

  return (
    <div className="min-h-screen flex flex-col">
      {settings?.announcementEnabled && settings.announcementText && (
        <div className="bg-primary text-primary-foreground py-2.5 px-4 text-center text-sm font-medium tracking-wide">
          <span>{settings.announcementText}</span>
        </div>
      )}

      <Navbar />

      <main className="flex-1">
        {/* ─── Cinematic Hero Banner Carousel ─── */}
        <section className="relative w-full overflow-hidden" style={{ height: "min(90vh, 680px)", minHeight: 400 }}>
          {/* Slides */}
          <AnimatePresence mode="wait">
            {activeBanners.length > 0 && banner ? (
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-0 cursor-pointer"
                onClick={() => handleBannerClick(banner)}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {/* Cinematic gradient — no blocking rectangle */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
              </motion.div>
            ) : (
              <motion.div
                key="fallback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-background"
              />
            )}
          </AnimatePresence>

          {/* Text overlay — sits on gradient, not in a box */}
          <div className="absolute inset-0 flex items-end pb-16 md:pb-20 px-6 md:px-16 lg:px-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentBanner}`}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="max-w-2xl"
              >
                {banner?.subtitle && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
                      <Sparkles className="h-3 w-3" />
                      {banner.subtitle}
                    </span>
                  </div>
                )}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.05] tracking-tight drop-shadow-lg mb-5">
                  {banner?.title || settings?.heroTitle || "Curated Premium Finds."}
                </h1>
                {!banner && (
                  <p className="text-lg md:text-xl text-white/80 mb-7 max-w-lg leading-relaxed">
                    {settings?.heroSubtitle || "Discover exclusive items handpicked for you."}
                  </p>
                )}
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    size="lg"
                    className="rounded-full px-8 h-13 text-base bg-white text-foreground hover:bg-white/90 shadow-2xl font-semibold transition-all hover:scale-[1.02]"
                    onClick={e => { e.stopPropagation(); banner?.linkUrl ? handleBannerClick(banner) : setLocation("/products"); }}
                  >
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  {activeBanners.length <= 1 && (
                    <Button
                      size="lg"
                      variant="ghost"
                      className="rounded-full px-6 text-white hover:text-white hover:bg-white/10 border border-white/30 backdrop-blur-sm"
                      asChild
                    >
                      <Link href="/products">Browse All</Link>
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          {activeBanners.length > 1 && (
            <>
              {/* Prev/Next arrows */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm border border-white/20 transition-all hover:scale-110 z-10"
                onClick={e => { e.stopPropagation(); prevBanner(); setIsAutoPlaying(false); }}
                aria-label="Previous banner"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2.5 backdrop-blur-sm border border-white/20 transition-all hover:scale-110 z-10"
                onClick={e => { e.stopPropagation(); nextBanner(); setIsAutoPlaying(false); }}
                aria-label="Next banner"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {activeBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setCurrentBanner(i); setIsAutoPlaying(false); }}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: i === currentBanner ? 24 : 8,
                      height: 8,
                      background: i === currentBanner ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                    }}
                    aria-label={`Go to banner ${i + 1}`}
                  />
                ))}
              </div>

              {/* Progress bar */}
              {isAutoPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                  <motion.div
                    key={`progress-${currentBanner}`}
                    className="h-full bg-white/60"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </div>
              )}
            </>
          )}

          {/* No banners — pure gradient hero */}
          {activeBanners.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="text-center max-w-2xl">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight tracking-tight mb-6"
                >
                  {settings?.heroTitle || "Shop Smart,"}
                  <br />
                  <span className="gradient-text">Shop Easy.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-muted-foreground mb-8"
                >
                  {settings?.heroSubtitle || "Discover exclusive items handpicked for you. Fast shipping, guaranteed quality."}
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Button size="lg" className="rounded-full px-10 h-14 text-base shadow-xl shadow-primary/25" asChild>
                    <Link href="/products">Explore Collection <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </section>

        {/* ─── Trust Strip ─── */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm text-muted-foreground font-medium">
              {["Free Shipping on orders ₹499+", "Genuine Branded Products", "Easy 7-Day Returns", "24/7 WhatsApp Support"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-primary fill-primary shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Categories ─── */}
        <section className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-4xl font-display font-bold">Shop by Category</h2>
              <p className="text-muted-foreground text-sm mt-1">Find exactly what you're looking for</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoadingCategories ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
            ) : (
              categories?.map((category, i) => {
                const colorIndex = i % CATEGORY_GRADIENTS.length;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    className="group"
                  >
                    <Link href={`/products?category=${category.id}`} className="block">
                      <div className={`relative h-32 rounded-3xl overflow-hidden ${CATEGORY_BG[colorIndex]} border border-white/60 shadow-md hover:shadow-xl transition-all duration-300`}>
                        {/* Gradient glow on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[colorIndex]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-2 p-3">
                          <div className={`group-hover:text-white transition-colors duration-300 group-hover:scale-125 transform scale-100 ${CATEGORY_TEXT[colorIndex]}`}>
                            <CategoryIcon name={category.icon} />
                          </div>
                          <span className={`text-xs font-bold text-center leading-tight group-hover:text-white transition-colors duration-300 ${CATEGORY_TEXT[colorIndex]}`}>
                            {category.name}
                          </span>
                        </div>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform duration-700" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* ─── Featured Deals ─── */}
        <section className="container mx-auto px-4 md:px-6 pb-16 md:pb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-4xl font-display font-bold">Featured Deals</h2>
              <p className="text-muted-foreground text-sm mt-1">Handpicked offers, best prices</p>
            </div>
            <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary/5 gap-2" asChild>
              <Link href="/products?featured=true">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingFeatured ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)
            ) : (
              featuredProducts?.slice(0, 4).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))
            )}
          </div>
        </section>

        {/* ─── New Arrivals ─── */}
        <section className="bg-gradient-to-b from-accent/50 to-accent/20 border-y border-border/30">
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-4xl font-display font-bold">New Arrivals</h2>
                <p className="text-muted-foreground text-sm mt-1">Just dropped — shop before it sells out</p>
              </div>
              <Button variant="outline" className="rounded-full bg-white/60 backdrop-blur-sm gap-2" asChild>
                <Link href="/products">Shop All <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoadingRecent ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)
              ) : (
                recentProducts?.slice(0, 4).map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* ─── Promo CTA Strip ─── */}
        <section className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-10 md:p-16 text-white text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3"
              >
                Limited Time Offer
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-display font-bold mb-4"
              >
                {settings?.offerBadgeText || "Up to 60% off on select items"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-white/70 mb-8 max-w-md mx-auto"
              >
                Don't miss out on our best deals. Shop now before stock runs out!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button size="lg" className="rounded-full px-10 h-14 bg-white text-primary hover:bg-white/90 font-bold shadow-2xl hover:scale-[1.02] transition-transform" asChild>
                  <Link href="/products">Shop the Sale <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating WhatsApp */}
      {settings?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute right-full mr-3 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
            Need help? Chat with us!
          </span>
        </a>
      )}
    </div>
  );
}
