"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Routes qui ne doivent PAS afficher la sidebar
  const routesWithoutSidebar = [
    "/landing",
    "/login",
    "/register",
    "/"
  ];
  
  const shouldShowSidebar = !routesWithoutSidebar.includes(pathname);
  
  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarProvider>
    );
  }
  
  // Pour les pages sans sidebar (landing, auth, etc.)
  return (
    <main className="w-full">
      {children}
    </main>
  );
}