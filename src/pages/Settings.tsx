
import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode state
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setDarkMode(enabled);
    
    toast({
      title: enabled ? "Dark Mode Enabled" : "Light Mode Enabled",
      description: `Theme preference has been saved.`
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Settings"
        description="Manage your application preferences"
        icon={<SettingsIcon className="h-6 w-6" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure how the timetable application works
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Interface</h3>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark mode for the application
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable animations throughout the interface
                </p>
              </div>
              <Switch id="animations" defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Timetable Preferences</h3>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="conflict-detection">Automatic Conflict Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically check for timetable conflicts
                </p>
              </div>
              <Switch id="conflict-detection" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="color-coding">Color Coding</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign colors to subjects
                </p>
              </div>
              <Switch id="color-coding" defaultChecked />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Data Management</h3>
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="save-auto">Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes to timetables
                </p>
              </div>
              <Switch id="save-auto" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="export-format">Default to PDF Export</Label>
                <p className="text-sm text-muted-foreground">
                  Use PDF as the default export format
                </p>
              </div>
              <Switch id="export-format" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
