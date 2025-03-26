
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TimetableDisplayProps {
  timetableData: any;
  viewType?: "division" | "teacher" | "room";
  showTeachers?: boolean;
  showRooms?: boolean;
  filterId?: string;
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ 
  timetableData, 
  viewType = "division",
  showTeachers = true,
  showRooms = true,
  filterId
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

  // Function to filter and transform data based on view type
  const getFilteredData = () => {
    if (viewType === "division" || !filterId) {
      return timetableData;
    }

    // Filter timetable data for a specific teacher or room
    const filteredData: any = {};
    
    days.forEach(day => {
      filteredData[day] = {};
      
      if (timetableData[day]) {
        periods.forEach(period => {
          const slot = timetableData[day][period];
          
          if (slot) {
            let match = false;
            
            if (viewType === "teacher" && slot.teacher) {
              const teacherId = typeof slot.teacher === 'string' ? slot.teacher : slot.teacher?.id;
              match = teacherId === filterId;
            } else if (viewType === "room" && slot.room) {
              const roomId = typeof slot.room === 'string' ? slot.room : slot.room?.id;
              match = roomId === filterId;
            }
            
            if (match) {
              filteredData[day][period] = {...slot};
            }
          }
        });
      }
    });
    
    return filteredData;
  };

  const filteredData = getFilteredData();

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
                const slot = filteredData[day]?.[period];
                
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
