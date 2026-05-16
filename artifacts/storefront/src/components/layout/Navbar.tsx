import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useGetSettings } from "@workspace/api-client-react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = useCart((state) => state.getCartCount());
  const { data: settings } = useGetSettings();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path} className="text-2xl font-display font-semibold hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold gradient-text tracking-tight">
              {settings?.storeName || "ShopEasy"}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "text-sm font-medium hover:text-primary transition-colors",
                location === link.path ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
            <Link href="/products">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          
          <Button variant="outline" size="icon" className="relative rounded-full border-primary/20 hover:bg-primary/5" asChild>
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
