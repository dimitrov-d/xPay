"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api";
import { useCurrentUser, useSignOut } from "@coinbase/cdp-hooks";
import { List, LogOut, Menu, User, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {currentUser && onToggleSidebar && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="w-12 h-12"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="h-8 w-px bg-border" />
              </>
            )}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer px-2 py-2"
            >
              <Image
                src="/logo.png"
                alt="xPay"
                width={72}
                height={72}
                className="w-20 h-20"
              />
              <span className="text-2xl font-bold">xPAY</span>
            </Link>
          </div>

          {currentUser && (
            <div className="flex items-center gap-6">
              <div className="h-8 w-px bg-border" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-12 h-12 bg-accent/10 hover:bg-accent/20"
                  >
                    <div className="rounded-full bg-accent p-2">
                      <User className="w-5 h-5 text-accent-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="px-4 py-3 cursor-pointer"
                  >
                    <Wallet className="mr-3 h-5 w-5" />
                    <span className="font-medium">Wallet & Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/my-endpoints")}
                    className="px-4 py-3 cursor-pointer"
                  >
                    <List className="mr-3 h-5 w-5" />
                    <span className="font-medium">My Endpoints</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-3 cursor-pointer"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span className="font-medium">
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </span>
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

