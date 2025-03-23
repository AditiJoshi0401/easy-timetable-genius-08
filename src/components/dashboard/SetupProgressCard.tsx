
import { BookOpen, Users, Building, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type SetupProgressCardProps = {
  subjectCount: number;
  teacherCount: number;
  roomCount: number;
  streamCount: number;
  divisionCount: number;
  setupProgress: number;
};

export const SetupProgressCard = ({
  subjectCount,
  teacherCount,
  roomCount,
  streamCount,
  divisionCount,
  setupProgress,
}: SetupProgressCardProps) => {
  return (
    <Card className="md:w-1/3">
      <CardHeader className="pb-2">
        <CardTitle>Setup Progress</CardTitle>
        <CardDescription>
          Complete these steps to start creating timetables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{setupProgress}%</span>
          </div>
          <Progress value={setupProgress} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${subjectCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Add Subjects</div>
              <div className="text-xs text-muted-foreground">
                {subjectCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {subjectCount} subjects added</div> : 'No subjects added yet'}
              </div>
            </div>
            {subjectCount === 0 && (
              <Link to="/data-input">
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${teacherCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
              <Users className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Add Teachers</div>
              <div className="text-xs text-muted-foreground">
                {teacherCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {teacherCount} teachers added</div> : 'No teachers added yet'}
              </div>
            </div>
            {teacherCount === 0 && (
              <Link to="/data-input">
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${roomCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
              <Building className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Add Rooms</div>
              <div className="text-xs text-muted-foreground">
                {roomCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {roomCount} rooms added</div> : 'No rooms added yet'}
              </div>
            </div>
            {roomCount === 0 && (
              <Link to="/data-input">
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full ${streamCount > 0 ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Add Streams</div>
              <div className="text-xs text-muted-foreground">
                {streamCount > 0 ? <div className="flex items-center"><CheckCircle2 className="h-3 w-3 mr-1 text-green-600" /> {streamCount} streams added</div> : 'No streams added yet'}
              </div>
            </div>
            {streamCount === 0 && (
              <Link to="/streams-manager">
                <Button variant="ghost" size="sm">
                  Add
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
