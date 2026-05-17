import { Link, useLocation } from "wouter";
import { useAdminLogout, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function AdminSidebar({ className }: { className?: string }) {
  const [location, setLocation] = useLocation();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
        setLocation("/admin");
        toast.success("Logged out successfully");
      },
    });
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: ImageIcon, label: "Banners", href: "/admin/banners" },
    { icon: Settings, label: "Settings", href: "/admin/settings" },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64", className)}>
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white text-xs font-display font-bold">SE</span>
          </div>
          <div>
            <span className="text-base font-display font-bold text-sidebar-foreground">ShopEasy</span>
            <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none mt-0.5">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold px-3 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm",
                isActive
                  ? "bg-primary text-white font-semibold shadow-md shadow-primary/25"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4.5 w-4.5 shrink-0",
                isActive ? "text-white" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
              )} />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border/50 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground text-sm h-9 rounded-xl"
          asChild
        >
          <Link href="/" target="_blank">
            <ExternalLink className="h-4 w-4 mr-3 shrink-0" />
            View Storefront
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive text-sm h-9 rounded-xl"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4 mr-3 shrink-0" />
          {logout.isPending ? "Logging out…" : "Logout"}
        </Button>
      </div>
    </div>
  );
}
