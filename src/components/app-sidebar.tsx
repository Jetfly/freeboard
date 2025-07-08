"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Rapports",
    url: "/rapports",
    icon: BarChart3,
  },
  {
    title: "Paramètres",
    url: "/parametres",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const handleLogout = async () => {
    console.log('🔄 Tentative de déconnexion...');
    
    try {
      // Méthode 1: Déconnexion Supabase avec scope global
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('❌ Erreur lors de la déconnexion Supabase:', error);
      } else {
        console.log('✅ Déconnexion Supabase réussie');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la déconnexion:', error);
    }
    
    // Méthode 2: Nettoyage manuel complet
    console.log('🧹 Nettoyage manuel des données de session...');
    
    if (typeof window !== 'undefined') {
      // Supprimer le localStorage et sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Supprimer spécifiquement le cookie d'auth Supabase
      const cookieName = 'sb-irgykbpyraczsyehrpbw-auth-token';
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      
      // Supprimer tous les autres cookies Supabase
      document.cookie.split(";").forEach(function(c) { 
        const cookieName = c.split("=")[0].trim();
        if (cookieName.startsWith('sb-')) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }
      });
      
      console.log('✅ Nettoyage manuel terminé');
    }
    
    // Attendre un peu pour laisser le temps au serveur de traiter
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Redirection forcée
    console.log('🔄 Redirection vers /login...');
    window.location.replace('/login');
  };

  // Éviter les problèmes d'hydratation en attendant le montage côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">FreeBoard</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Utiliser mounted pour éviter les différences serveur/client
                const isActive = mounted ? pathname === item.url : false;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Déconnexion
          </button>
          <div className="text-xs text-gray-500 text-center">
            Version 1.0.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}