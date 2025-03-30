
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Calendar, Home, Settings, Database, LayoutGrid, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/timetable-editor", icon: Calendar, label: "Timetable Editor" },
  { to: "/data-input", icon: Database, label: "Data Management" },
  { to: "/streams-manager", icon: BookOpen, label: "Structure" },
  { to: "/view-timetables", icon: LayoutGrid, label: "View Timetables" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface MobileNavProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function MobileNav({ isSidebarOpen, toggleSidebar }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-sm">
      <div className="flex h-14 items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2" id="sidebar-toggle" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <div className="px-7">
              <div className="flex items-center">
                <div className="relative h-8 w-8 mr-2">
                  <div className="absolute inset-0 bg-primary rounded-md opacity-20 animate-float"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-primary font-bold">TG</div>
                </div>
                <h1 className="font-display text-xl font-semibold tracking-tight">Timetable Genius</h1>
              </div>
            </div>
            <nav className="mt-8 px-2">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-accent/70 hover:text-accent-foreground",
                      isActive 
                        ? "bg-accent text-accent-foreground" 
                        : "text-foreground/80"
                    )}
                    end={item.to === "/"}
                  >
                    <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex items-center">
          <div className="relative h-6 w-6 mr-2">
            <div className="absolute inset-0 bg-primary rounded-md opacity-20 animate-float"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xs">TG</div>
          </div>
          <h1 className="font-display text-lg font-medium tracking-tight">Timetable Genius</h1>
        </div>
      </div>
    </header>
  );
}
