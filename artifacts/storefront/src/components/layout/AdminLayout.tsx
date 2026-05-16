import { useRequireAuth } from "@/hooks/use-require-auth";
import { AdminSidebar } from "./AdminSidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // will redirect in useRequireAuth
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-sidebar">
        <span className="text-xl font-display font-bold">ShopEasy Admin</span>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar className="fixed inset-y-0 left-0" />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-[calc(100vh-73px)] md:min-h-screen overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
