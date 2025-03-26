
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TimetableDisplayProps {
  timetableData: any;
  showTeachers?: boolean;
  showRooms?: boolean;
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ 
  timetableData, 
  showTeachers = true,
  showRooms = true 
}) => {
  if (!timetableData || Object.keys(timetableData).length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No timetable data available</p>
      </div>
    );
  }

  // Create an array of days and periods from timetable data
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = Array.from(
    new Set(
      Object.values(timetableData)
        .flatMap((dayData: any) => Object.keys(dayData))
    )
  ).sort();

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse border border-border">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-border font-bold">Day/Period</TableHead>
            {periods.map((period) => (
              <TableHead key={period} className="border border-border font-medium text-center">
                {period}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => (
            <TableRow key={day}>
              <TableCell className="border border-border font-medium">{day}</TableCell>
              {periods.map((period) => {
                const slot = timetableData[day]?.[period];
                
                return (
                  <TableCell key={`${day}-${period}`} className="border border-border p-2 text-center">
                    {slot ? (
                      <div className="space-y-1">
                        <div className="font-medium">
                          {typeof slot.subject === 'string' 
                            ? slot.subject 
                            : slot.subject?.name || 'Unknown Subject'}
                        </div>
                        {showTeachers && slot.teacher && (
                          <div className="text-xs text-muted-foreground">
                            {typeof slot.teacher === 'string'
                              ? slot.teacher
                              : slot.teacher?.name || 'Unknown Teacher'}
                          </div>
                        )}
                        {showRooms && slot.room && (
                          <div className="text-xs text-muted-foreground">
                            Room: {typeof slot.room === 'string'
                              ? slot.room
                              : slot.room?.number || 'Unknown Room'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TimetableDisplay;
