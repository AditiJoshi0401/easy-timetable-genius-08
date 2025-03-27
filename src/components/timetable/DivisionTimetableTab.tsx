
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import TimetableDisplay from "@/components/timetable/TimetableDisplay";

interface DivisionTimetableTabProps {
  streams: any[];
  years: any[];
  divisions: any[];
  stream: string;
  year: string;
  division: string;
  selectedTimetable: any;
  setStream: (value: string) => void;
  setYear: (value: string) => void;
  setDivision: (value: string) => void;
  onApplyFilters: () => void;
  onManageStructure: () => void;
  timetableRef: React.RefObject<HTMLDivElement>;
}

const DivisionTimetableTab: React.FC<DivisionTimetableTabProps> = ({
  streams,
  years,
  divisions,
  stream,
  year,
  division,
  selectedTimetable,
  setStream,
  setYear,
  setDivision,
  onApplyFilters,
  onManageStructure,
  timetableRef
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
          <Label>Year</Label>
          <Select value={year} onValueChange={setYear} disabled={!stream || years.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.length > 0 ? (
                years.map((year: any) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-years-available" disabled>
                  {stream ? "No years available for this stream" : "Select a stream first"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Division</Label>
          <Select value={division} onValueChange={setDivision} disabled={!year || divisions.length === 0}>
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
                  {year ? "No divisions available for this year" : "Select a year first"}
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
        <Button onClick={onApplyFilters} size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Apply Filters
        </Button>
      </div>

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
