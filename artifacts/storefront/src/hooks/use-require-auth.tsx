import { useLocation } from "wouter";
import { useEffect } from "react";
import { useGetAuthMe } from "@workspace/api-client-react";

export function useRequireAuth() {
  const [, setLocation] = useLocation();
  const { data: auth, isLoading } = useGetAuthMe();

  useEffect(() => {
    if (!isLoading && !auth?.authenticated) {
      setLocation("/admin");
    }
  }, [auth, isLoading, setLocation]);

  return { isLoading, isAuthenticated: !!auth?.authenticated };
}
