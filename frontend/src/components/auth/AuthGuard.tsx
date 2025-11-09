"use client";

import { authApi } from "@/lib/api";
import { getAuthUser, isAuthenticated } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component to protect routes that require authentication
 * 
 * Usage:
 * <AuthGuard requireAuth={true} redirectTo="/login">
 *   <ProtectedContent />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/"
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!requireAuth) {
        setIsAuthorized(true);
        setIsVerifying(false);
        return;
      }

      if (!isAuthenticated()) {
        setIsAuthorized(false);
        setIsVerifying(false);
        router.push(redirectTo);
        return;
      }

      try {
        const result = await authApi.verifyToken();

        if (result.valid) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setIsAuthorized(false);
        router.push(redirectTo);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [pathname, requireAuth, redirectTo, router]);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}

/**
 * Hook to get current authenticated user
 */
export function useAuthUser() {
  const [user, setUser] = useState(getAuthUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getAuthUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return user;
}

