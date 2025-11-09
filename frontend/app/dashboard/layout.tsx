"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useCurrentUser } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      <Sidebar />
      <main className="flex-1 pt-20 pb-12 ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

