import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminLogin, useGetAuthMe, getGetAuthMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useAdminLogin();
  
  const { data: auth, isLoading } = useGetAuthMe();

  useEffect(() => {
    if (auth?.authenticated) {
      setLocation("/admin/dashboard");
    }
  }, [auth, setLocation]);

  if (isLoading) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ data: { password } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAuthMeQueryKey() });
        toast.success("Login successful");
        setLocation("/admin/dashboard");
      },
      onError: () => {
        toast.error("Invalid password");
        setPassword("");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center pb-8 pt-10">
          <CardTitle className="text-3xl font-display font-bold">ShopEasy Admin</CardTitle>
          <CardDescription>Enter the secure password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg" 
              disabled={login.isPending || !password}
            >
              {login.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
