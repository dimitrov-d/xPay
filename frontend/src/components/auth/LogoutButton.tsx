"use client";

import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api";
import { useSignOut } from "@coinbase/cdp-hooks";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function LogoutButton({
  variant = "ghost",
  size = "default",
  showIcon = true,
  children,
  className,
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signOut } = useSignOut();

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await authApi.logout();

      await signOut();

      toast.success("Logged out successfully", {
        description: "You have been signed out of your account and wallet",
      });

      router.push("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: error.message || "Failed to logout. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {children || (isLoading ? "Logging out..." : "Logout") as any}
    </Button>
  );
}

