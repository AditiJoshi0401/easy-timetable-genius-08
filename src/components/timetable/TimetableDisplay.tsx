
import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleType, getRoleDisplayName } from "@/models/Role";

interface TimetableDisplayProps {
  timetableData: any;
  viewType?: "division" | "teacher" | "room" | "subject";
  showTeachers?: boolean;
  showRooms?: boolean;
  showStreamInfo?: boolean;
  filterId?: string;
  invertAxis?: boolean;
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

// Define the official day and time slot order
const OFFICIAL_DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const OFFICIAL_TIME_SLOTS_ORDER = [
  "9:30 - 10:30",
  "10:30 - 11:30", 
  "11:30 - 12:30",
  "12:30 - 1:30",
  "1:30 - 2:30",
  "2:30 - 3:30",
  "3:30 - 4:30",
  "4:30 - 5:30"
];

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

  // Use official ordering for days and periods
  const days = OFFICIAL_DAYS_ORDER.filter(day => timetableData[day]);
  
  // Sort the periods to ensure correct time ordering using official order
  const periods = useMemo(() => {
    const allPeriods = Array.from(
      new Set(
        Object.values(timetableData)
          .flatMap((dayData: any) => Object.keys(dayData))
      )
    );
    
    // Sort periods according to official time slots order
    return allPeriods.sort((a, b) => {
      const indexA = OFFICIAL_TIME_SLOTS_ORDER.indexOf(a);
      const indexB = OFFICIAL_TIME_SLOTS_ORDER.indexOf(b);
      
      // If both periods are in the official order, use that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // If only one is in the official order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // If neither is in the official order, sort alphabetically
      return a.localeCompare(b);
    });
  }, [timetableData]);

  // Function to filter and transform data based on view type
  const getFilteredData = () => {
    if (viewType === "division" && !filterId && !teacherId && !roomId) {
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
              const slotTeacherId = typeof slot.teacher === 'string' ? slot.teacher : slot.teacher?.id;
              match = slotTeacherId === filterId || slotTeacherId === teacherId;
            } else if (viewType === "room" && slot.room) {
              const slotRoomId = typeof slot.room === 'string' ? slot.room : slot.room?.id;
              match = slotRoomId === filterId || slotRoomId === roomId;
            } else if (viewType === "subject" && slot.subject) {
              const subjectId = typeof slot.subject === 'string' ? slot.subject : slot.subject?.id;
              match = subjectId === filterId;
            } else if (viewType === "division") {
              // For division view, just include all slots
              match = true;
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

  // Function to get ordered timetable data for export
  const getOrderedTimetableData = () => {
    const orderedData: any = {};
    
    // Ensure days are in the correct order
    OFFICIAL_DAYS_ORDER.forEach(day => {
      if (filteredData[day]) {
        orderedData[day] = {};
        
        // Ensure time slots are in the correct order
        OFFICIAL_TIME_SLOTS_ORDER.forEach(period => {
          if (filteredData[day][period]) {
            orderedData[day][period] = filteredData[day][period];
          }
        });
        
        // Add any additional periods not in the official order
        Object.keys(filteredData[day]).forEach(period => {
          if (!OFFICIAL_TIME_SLOTS_ORDER.includes(period)) {
            orderedData[day][period] = filteredData[day][period];
          }
        });
      }
    });
    
    return orderedData;
  };

  // Expose the ordered data for export functionality
  React.useEffect(() => {
    if (window) {
      (window as any).getOrderedTimetableData = getOrderedTimetableData;
    }
  }, [filteredData]);

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
                            {typeof slot.teacher === 'object' && slot.teacher && slot.teacher.role && (
                              <span> ({getRoleDisplayName(slot.teacher.role as RoleType)})</span>
                            )}
                          </div>
                        )}
                        {showRooms && slot.room && (
                          <div className="text-xs text-muted-foreground">
                            Room: {typeof slot.room === 'string'
                              ? slot.room
                              : slot.room?.number || 'Unknown Room'}
                            {typeof slot.room === 'object' && slot.room && slot.room.type && (
                              <span> ({slot.room.type})</span>
                            )}
                          </div>
                        )}
                        {showStreamInfo && slot.stream && (
                          <div className="text-xs text-muted-foreground">
                            {slot.stream}
                            {slot.year && <span> - Year {slot.year}</span>}
                            {slot.division && <span> - {slot.division}</span>}
                          </div>
                        )}
                        {slot.type && (
                          <div className="text-xs text-muted-foreground">
                            Type: {slot.type}
                          </div>
                        )}
                        {slot.lectures && (
                          <div className="text-xs text-muted-foreground">
                            Lectures: {slot.lectures}
                          </div>
                        )}
                        {slot.tutorials && (
                          <div className="text-xs text-muted-foreground">
                            Tutorials: {slot.tutorials}
                          </div>
                        )}
                        {slot.practical && (
                          <div className="text-xs text-muted-foreground">
                            Practical: {slot.practical}
                          </div>
                        )}
                        {slot.credits && (
                          <div className="text-xs text-muted-foreground">
                            Credits: {slot.credits}
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
