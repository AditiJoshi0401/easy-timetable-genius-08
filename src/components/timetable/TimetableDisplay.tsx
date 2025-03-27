
import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TimetableDisplayProps {
  timetableData: any;
  viewType?: "division" | "teacher" | "room" | "subject";
  showTeachers?: boolean;
  showRooms?: boolean;
  showStreamInfo?: boolean;
  filterId?: string;
  invertAxis?: boolean;
  // Add new props for teacher and room filtering
  teacherId?: string;
  roomId?: string;
  teachers?: any[];
  rooms?: any[];
}

// Define a set of pleasing background colors for subjects
const SUBJECT_COLORS = [
  "#F2FCE2", // Soft Green
  "#FEF7CD", // Soft Yellow
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#D3E4FD", // Soft Blue
  "#F1F0FB", // Soft Gray
  "#E0F2F1", // Soft Teal
  "#EDE7F6", // Soft Lavender
  "#FFF3E0", // Soft Amber
  "#E8F5E9", // Mint Green
  "#F3E5F5", // Pale Purple
  "#E1F5FE", // Light Blue
  "#FFF8E1", // Light Yellow
];

// Map to store subject-to-color associations
const subjectColorMap = new Map();

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ 
  timetableData, 
  viewType = "division",
  showTeachers = true,
  showRooms = true,
  showStreamInfo = false,
  filterId,
  invertAxis = false,
  teacherId,
  roomId,
  teachers,
  rooms
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
  
  // Sort the periods to ensure correct time ordering (9:30 - 10:30 comes first)
  const periods = useMemo(() => {
    const allPeriods = Array.from(
      new Set(
        Object.values(timetableData)
          .flatMap((dayData: any) => Object.keys(dayData))
      )
    );
    
    // Define a specific order for the periods (9:30 to 5:30)
    const timeOrder = [
      "9:30 - 10:30",
      "10:30 - 11:30",
      "11:30 - 12:30",
      "12:30 - 1:30",
      "1:30 - 2:30",
      "2:30 - 3:30",
      "3:30 - 4:30",
      "4:30 - 5:30"
    ];
    
    // Return the periods sorted according to our predefined order
    return allPeriods.sort((a, b) => {
      const indexA = timeOrder.indexOf(a);
      const indexB = timeOrder.indexOf(b);
      
      // If either period isn't in our predefined list, sort them regularly
      if (indexA === -1 || indexB === -1) {
        // Extract the starting hour and minute from the time slot (e.g., "9:30" from "9:30 - 10:30")
        const getStartTime = (timeSlot: string) => {
          const match = timeSlot.match(/^(\d+):(\d+)/);
          if (!match) return 0;
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          
          // Convert to 24-hour format for proper sorting
          if (timeSlot.includes("PM") && hours < 12) {
            hours += 12;
          }
          return hours * 60 + minutes;
        };
        
        return getStartTime(a) - getStartTime(b);
      }
      
      // Otherwise use our predefined order
      return indexA - indexB;
    });
  }, [timetableData]);

  // Function to filter and transform data based on view type
  const getFilteredData = () => {
    if (viewType === "division" || (!filterId && !teacherId && !roomId)) {
      return timetableData;
    }

    // Filter timetable data for a specific teacher, room, or subject
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
              match = teacherId === filterId || teacherId === teacherId;
            } else if (viewType === "room" && slot.room) {
              const roomId = typeof slot.room === 'string' ? slot.room : slot.room?.id;
              match = roomId === filterId || roomId === roomId;
            } else if (viewType === "subject" && slot.subject) {
              const subjectId = typeof slot.subject === 'string' ? slot.subject : slot.subject?.id;
              match = subjectId === filterId;
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

  // Get a color for a subject - consistently maps subjects to colors
  const getSubjectColor = (subject: any) => {
    const subjectId = typeof subject === 'string' ? subject : subject?.id || subject?.name;
    
    if (!subjectId) return "#FFFFFF"; // Default white for unknown subjects
    
    if (!subjectColorMap.has(subjectId)) {
      // Assign a new color from the palette
      const colorIndex = subjectColorMap.size % SUBJECT_COLORS.length;
      subjectColorMap.set(subjectId, SUBJECT_COLORS[colorIndex]);
    }
    
    return subjectColorMap.get(subjectId);
  };

  // Always display with periods as rows and days as columns (inverted axis)
  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse border border-border">
        <TableHeader>
          <TableRow>
            <TableHead className="border border-border font-bold">Period/Day</TableHead>
            {days.map((day) => (
              <TableHead key={day} className="border border-border font-medium text-center">
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period}>
              <TableCell className="border border-border font-medium">{period}</TableCell>
              {days.map((day) => {
                const slot = filteredData[day]?.[period];
                const backgroundColor = slot?.subject ? getSubjectColor(slot.subject) : "transparent";
                
                return (
                  <TableCell 
                    key={`${period}-${day}`} 
                    className="border border-border p-2 text-center"
                    style={{ backgroundColor }}
                  >
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
                        {showStreamInfo && slot.stream && slot.year && slot.division && (
                          <div className="text-xs text-muted-foreground">
                            {slot.stream} - Year {slot.year} - {slot.division}
                          </div>
                        )}
                        {slot.type && (
                          <div className="text-xs text-muted-foreground">
                            Type: {slot.type}
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
