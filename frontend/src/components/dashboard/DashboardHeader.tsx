"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api";
import { useSignOut } from "@coinbase/cdp-hooks";
import { toast } from "sonner";
import { useState } from "react";

interface DashboardHeaderProps {
  onToggleSidebar?: () => void;
}

export const DashboardHeader = ({ onToggleSidebar }: DashboardHeaderProps) => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { signOut } = useSignOut();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Logout from backend (clears JWT token)
      await authApi.logout();

      // Sign out from Coinbase CDP wallet session
      await signOut();

      toast.success("Logged out successfully", {
        description: "You have been signed out of your account and wallet",
      });

      // Redirect to home page
      router.push("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description: error.message || "Failed to logout. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {currentUser && onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="w-10 h-10"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image
                src="/logo.png"
                alt="xPay"
                width={64}
                height={64}
                className="w-16 h-16"
              />
              <span className="text-2xl font-bold">xPAY</span>
            </Link>
          </div>

          {currentUser && (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-10 h-10 bg-accent/10"
                  >
                    <div className="rounded-full bg-accent p-2">
                      <User className="w-5 h-5 text-accent-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/wallet")}>
                    Wallet & Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-endpoints")}>
                    My Endpoints
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

