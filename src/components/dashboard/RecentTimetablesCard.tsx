
import { Calendar, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Timetable = {
  id: string;
  name: string;
  lastModified: string;
};

type RecentTimetablesCardProps = {
  recentTimetables: Timetable[];
};

export const RecentTimetablesCard = ({
  recentTimetables,
}: RecentTimetablesCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Timetables</CardTitle>
          <CardDescription>
            Your recently created or modified timetables
          </CardDescription>
        </div>
        <Link to="/timetable-editor">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            New Timetable
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentTimetables.length > 0 ? (
          <div className="space-y-4">
            {recentTimetables.map((timetable) => (
              <div key={timetable.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{timetable.name}</div>
                    <div className="text-sm text-muted-foreground">Last modified: {timetable.lastModified}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/view-timetables">
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Link to="/timetable-editor">
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No timetables yet</h3>
            <p className="text-muted-foreground mt-1">
              Start by creating your first timetable
            </p>
            <Link to="/timetable-editor" className="mt-4 inline-block">
              <Button>Create New Timetable</Button>
            </Link>
          </div>
        )}
      </CardContent>
      {recentTimetables.length > 0 && (
        <CardFooter className="flex justify-center">
          <Link to="/view-timetables">
            <Button variant="link" className="gap-1">
              View all timetables
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
