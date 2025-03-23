
import { BookOpen, Users, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type OverviewCardProps = {
  subjectCount: number;
  teacherCount: number;
  roomCount: number;
  streamCount: number;
  divisionCount: number;
  timetableCount: number;
  currentDate: string;
};

export const OverviewCard = ({
  subjectCount,
  teacherCount,
  roomCount,
  streamCount,
  divisionCount,
  timetableCount,
  currentDate,
}: OverviewCardProps) => {
  return (
    <Card className="md:w-2/3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Overview</CardTitle>
          <Badge variant="outline">{currentDate}</Badge>
        </div>
        <CardDescription>
          Summary of your timetable application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">{subjectCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Subjects</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">{teacherCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Teachers</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">{roomCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Rooms</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">{streamCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Streams</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">{divisionCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Divisions</div>
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-3xl font-bold text-primary">{timetableCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Timetables</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
