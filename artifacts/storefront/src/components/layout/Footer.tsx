import { Link } from "wouter";
import { useGetSettings } from "@workspace/api-client-react";
import { Instagram, Facebook, MessageCircle } from "lucide-react";

export function Footer() {
  const { data: settings } = useGetSettings();

  return (
    <footer className="bg-muted py-12 md:py-16 mt-20 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-display font-bold text-foreground tracking-tight">
                {settings?.storeName || "ShopEasy"}
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              {settings?.storeTagline || "Premium curated goods for the modern lifestyle."}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors">Cart</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
            <div className="flex gap-4">
              {settings?.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.whatsappNumber && (
                <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ShopEasy. All rights reserved.`}</p>
        </div>
      </div>
    </footer>
  );
}
