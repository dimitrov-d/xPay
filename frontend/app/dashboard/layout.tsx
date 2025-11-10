"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useCurrentUser();
  const router = useRouter();
  // Auto-collapse on mobile, expanded on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      // On mobile (< 1024px), always start collapsed
      // On desktop, check localStorage or default to not collapsed
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!currentUser) {
    return null;
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <main
        className={`flex-1 pt-20 pb-12 transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

