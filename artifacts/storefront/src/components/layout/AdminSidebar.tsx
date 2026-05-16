import { Link, useLocation } from "wouter";
import { useAdminLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetAuthMeQueryKey } from "@workspace/api-client-react";

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
      }
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
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-sidebar-foreground">ShopEasy</span>
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider">Admin</span>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-md shadow-primary/20" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
