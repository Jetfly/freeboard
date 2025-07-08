"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { OneHandedProvider } from "@/components/one-handed-layout";
import { MobileAlertsContainer } from "@/components/mobile-alerts";


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
      <OneHandedProvider>
        <SidebarProvider>
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          
          {/* Main content */}
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>
          
          {/* Mobile Bottom Navigation - hidden on desktop */}
          <div className="md:hidden">
            <MobileBottomNav />
          </div>
          
          {/* Mobile Alerts Container */}
          <MobileAlertsContainer />
        </SidebarProvider>
      </OneHandedProvider>
    );
  }
  
  // Pour les pages sans sidebar (landing, auth, etc.)
  return (
    <main className="w-full">
      {children}
    </main>
  );
}