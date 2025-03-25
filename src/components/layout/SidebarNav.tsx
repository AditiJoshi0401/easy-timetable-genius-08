
import { NavLink } from "react-router-dom";
import { Calendar, Home, Settings, Database, LayoutGrid, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/timetable-editor", icon: Calendar, label: "Timetable Editor" },
  { to: "/data-input", icon: Database, label: "Data Management" },
  { to: "/streams-manager", icon: BookOpen, label: "Streams & Divisions" },
  { to: "/view-timetables", icon: LayoutGrid, label: "View Timetables" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  if (!isOpen) return null;
  
  return (
    <div id="sidebar" className="h-screen w-64 border-r border-border/40 bg-sidebar shadow-subtle flex flex-col animate-slide-in">
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative h-8 w-8 mr-2">
            <div className="absolute inset-0 bg-primary rounded-md opacity-20 animate-float"></div>
            <div className="absolute inset-0 flex items-center justify-center text-primary font-bold">TG</div>
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight">Timetable Genius</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/80"
              )}
              end={item.to === "/"}
              onClick={onClose}
            >
              <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border/40">
        <div className="glass-panel rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground">Timetable Genius v1.0</p>
          <p className="text-xs text-muted-foreground mt-1">AI-Powered Scheduling</p>
        </div>
      </div>
    </div>
  );
}
