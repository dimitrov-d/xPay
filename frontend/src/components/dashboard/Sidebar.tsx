"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { ChevronLeft, ChevronRight, Home, LayoutDashboard, List, Server, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const { currentUser } = useCurrentUser();

  if (!currentUser) return null;

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Endpoints",
      href: "/my-endpoints",
      icon: List,
    },
    {
      name: "MCP Servers",
      href: "/mcp-servers",
      icon: Server,
    },
    {
      name: "Wallet & Profile",
      href: "/profile",
      icon: Wallet,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-card border-r border-border transition-transform duration-300 z-50 ${
          collapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => {
                        // Auto-close on mobile after navigation
                        if (window.innerWidth < 1024 && !collapsed) {
                          onToggle();
                        }
                      }}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {(!collapsed || window.innerWidth < 1024) && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-2 border-t border-border space-y-2">
            <Link href="/">
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <Home className="w-5 h-5 shrink-0" />
                {(!collapsed || window.innerWidth < 1024) && (
                  <span className="text-sm font-medium">Back to Home</span>
                )}
              </div>
            </Link>

            {(!collapsed || window.innerWidth < 1024) && (
              <LogoutButton
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground w-full justify-start"
              >
                <span className="sr-only">Logout</span>
                <span className="text-sm font-medium">Logout</span>
              </LogoutButton>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="w-full hidden lg:flex"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

