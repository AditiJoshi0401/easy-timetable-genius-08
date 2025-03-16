
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarNav } from "./SidebarNav";
import { MobileNav } from "./MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background/90">
      {!isMobile && <SidebarNav />}
      
      <div className="flex-1 flex flex-col">
        {isMobile && <MobileNav />}
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="animate-fade-in max-w-[1800px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
