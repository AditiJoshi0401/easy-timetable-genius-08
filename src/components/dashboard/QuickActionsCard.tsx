
import { Calendar, Database, BookOpen, Presentation } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const QuickActionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <Link to="/timetable-editor">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Create New Timetable
            </Button>
          </Link>
          
          <Link to="/data-input">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Database className="h-4 w-4 text-primary" />
              Manage Data
            </Button>
          </Link>
          
          <Link to="/streams-manager">
            <Button variant="outline" className="w-full justify-start gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Configure Streams
            </Button>
          </Link>
          
          <Link to="/view-timetables">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Presentation className="h-4 w-4 text-primary" />
              View Timetables
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
