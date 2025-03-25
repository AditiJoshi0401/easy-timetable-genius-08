
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
  const [animations, setAnimations] = useState(true);
  const [conflictDetection, setConflictDetection] = useState(true);
  const [colorCoding, setColorCoding] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [pdfExport, setPdfExport] = useState(false);

  // Initialize dark mode state
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
    
    // Initialize other settings from localStorage if available
    const storedAnimations = localStorage.getItem('animations');
    const storedConflictDetection = localStorage.getItem('conflictDetection');
    const storedColorCoding = localStorage.getItem('colorCoding');
    const storedAutoSave = localStorage.getItem('autoSave');
    const storedPdfExport = localStorage.getItem('pdfExport');
    
    if (storedAnimations !== null) setAnimations(storedAnimations === 'true');
    if (storedConflictDetection !== null) setConflictDetection(storedConflictDetection === 'true');
    if (storedColorCoding !== null) setColorCoding(storedColorCoding === 'true');
    if (storedAutoSave !== null) setAutoSave(storedAutoSave === 'true');
    if (storedPdfExport !== null) setPdfExport(storedPdfExport === 'true');
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

  // Generic function to handle setting changes
  const updateSetting = (setting: string, value: boolean, stateSetter: (value: boolean) => void) => {
    localStorage.setItem(setting, value.toString());
    stateSetter(value);
    
    toast({
      title: `Setting Updated`,
      description: `${setting.charAt(0).toUpperCase() + setting.slice(1)} has been ${value ? 'enabled' : 'disabled'}.`
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
              <Switch 
                id="animations" 
                checked={animations}
                onCheckedChange={(value) => updateSetting('animations', value, setAnimations)}
              />
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
              <Switch 
                id="conflict-detection" 
                checked={conflictDetection}
                onCheckedChange={(value) => updateSetting('conflictDetection', value, setConflictDetection)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="color-coding">Color Coding</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign colors to subjects
                </p>
              </div>
              <Switch 
                id="color-coding" 
                checked={colorCoding}
                onCheckedChange={(value) => updateSetting('colorCoding', value, setColorCoding)}
              />
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
              <Switch 
                id="save-auto" 
                checked={autoSave}
                onCheckedChange={(value) => updateSetting('autoSave', value, setAutoSave)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="export-format">Default to PDF Export</Label>
                <p className="text-sm text-muted-foreground">
                  Use PDF as the default export format
                </p>
              </div>
              <Switch 
                id="export-format" 
                checked={pdfExport}
                onCheckedChange={(value) => updateSetting('pdfExport', value, setPdfExport)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
