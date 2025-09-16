
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import TimetableDisplay from "@/components/timetable/TimetableDisplay";

interface DivisionTimetableTabProps {
  streams: any[];
  semesters: any[];  // Changed from years to semesters
  divisions: any[];
  stream: string;
  semester: string;  // Changed from year to semester
  division: string;
  selectedTimetable: any;
  setStream: (value: string) => void;
  setSemester: (value: string) => void;  // Changed from setYear to setSemester
  setDivision: (value: string) => void;
  onApplyFilters: () => void;
  onManageStructure: () => void;
  timetableRef: React.RefObject<HTMLDivElement>;
  onExportTimetable?: (format: 'pdf' | 'excel' | 'json', timetable: any, type: 'division' | 'teacher' | 'room', entityName?: string) => void;
}

const DivisionTimetableTab: React.FC<DivisionTimetableTabProps> = ({
  streams,
  semesters,  // Changed from years to semesters
  divisions,
  stream,
  semester,  // Changed from year to semester
  division,
  selectedTimetable,
  setStream,
  setSemester,  // Changed from setYear to setSemester
  setDivision,
  onApplyFilters,
  onManageStructure,
  timetableRef,
  onExportTimetable
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Stream</Label>
          <Select value={stream} onValueChange={setStream}>
            <SelectTrigger>
              <SelectValue placeholder="Select Stream" />
            </SelectTrigger>
            <SelectContent>
              {streams.length > 0 ? (
                streams.map(stream => (
                  <SelectItem key={stream.id} value={stream.id}>
                    {stream.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-streams-available" disabled>
                  No streams available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Semester</Label>
          <Select value={semester} onValueChange={setSemester} disabled={!stream || semesters.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.length > 0 ? (
                semesters.map((semester: any) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-semesters-available" disabled>
                  {stream ? "No semesters available for this stream" : "Select a stream first"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Division</Label>
          <Select value={division} onValueChange={setDivision} disabled={!semester || divisions.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select Division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.length > 0 ? (
                divisions.map((division: any) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-divisions-available" disabled>
                  {semester ? "No divisions available for this semester" : "Select a semester first"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onManageStructure} size="sm">
          Manage Structure
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onApplyFilters} size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button onClick={onApplyFilters} size="sm" disabled={!stream || !semester || !division}>
            View Timetable
          </Button>
        </div>
      </div>

      {selectedTimetable && onExportTimetable && (
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={() => onExportTimetable('pdf', selectedTimetable, 'division', divisions.find(d => d.id === division)?.name)}>
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExportTimetable('excel', selectedTimetable, 'division', divisions.find(d => d.id === division)?.name)}>
            Export Excel
          </Button>
        </div>
      )}

      {selectedTimetable && (
        <div className="py-4" ref={timetableRef}>
          <TimetableDisplay 
            timetableData={selectedTimetable.data} 
            viewType="division"
            showTeachers={true} 
            showRooms={true}
          />
        </div>
      )}
    </div>
  );
};

export default DivisionTimetableTab;
