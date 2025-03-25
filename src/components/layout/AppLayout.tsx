
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { MobileNav } from './MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';

export const AppLayout = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const button = document.getElementById('sidebar-toggle');
        
        if (sidebar && 
            !sidebar.contains(event.target as Node) && 
            button && 
            !button.contains(event.target as Node)) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav
        isOpen={isSidebarOpen || !isMobile}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNav
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 pt-6 md:pt-10 pb-20 overflow-auto">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 border-t">
          <div className="mx-auto max-w-6xl flex justify-between items-center">
            <div className="text-sm dark:text-white">
              <div>Timetable Genius</div>
              <div className="text-xs text-muted-foreground dark:text-white">Copyright © 2025 BackslashN Devs</div>
            </div>
            <div className="text-sm text-muted-foreground">
              v1.0.0
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
