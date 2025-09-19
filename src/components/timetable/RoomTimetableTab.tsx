
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TimetableDisplay from "@/components/timetable/TimetableDisplay";
import { supabase } from "@/integrations/supabase/client";
import { checkForDuplicates } from "@/utils/dataValidation";
import { Room } from "@/services/supabaseService";

interface RoomTimetableTabProps {
  selectedTimetable: any;
  onApplyFilters: (roomId?: string) => Promise<any | null>;
  onExportTimetable?: (format: 'pdf' | 'excel' | 'json', timetable: any, type: 'division' | 'teacher' | 'room', entityName?: string, domElement?: HTMLElement | null) => void;
}

const RoomTimetableTab: React.FC<RoomTimetableTabProps> = ({
  selectedTimetable,
  onApplyFilters,
  onExportTimetable
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [filteredRoomData, setFilteredRoomData] = useState<any>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase.from('rooms').select('*');
        if (error) throw error;
        setRooms(data as Room[] || []);
      } catch (error: any) {
        console.error('Error fetching rooms:', error.message);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const types = [...new Set(rooms.map(room => room.type))];
      setRoomTypes(types);
    }
  }, [rooms]);

  useEffect(() => {
    let filtered = rooms || [];
    
    // Filter by room type if selected
    if (selectedRoomType) {
      filtered = filtered.filter(room => 
        room.type === selectedRoomType
      );
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const uniqueRooms = checkForDuplicates(filtered, 'number');
    setFilteredRooms(uniqueRooms || []);
  }, [rooms, selectedRoomType, searchTerm]);

  const handleViewRoomTimetable = (timetableParam?: any) => {
    const timetableToUse = timetableParam || selectedTimetable;
    if (!selectedRoom || !timetableToUse) return;

    // Filter the timetable data for the selected room
    const roomData = { ...timetableToUse.data };
    
    // Process each day in the timetable
    for (const day in roomData) {
      // For each time slot in the day
      for (const timeSlot in roomData[day]) {
        const slot = roomData[day][timeSlot];
        
        // If the slot doesn't reference the selected room (supports slot.rooms array and legacy slot.room), remove it
        let containsRoom = false;
        if (!slot) {
          containsRoom = false;
        } else {
          // Check slot.rooms array (new multi-room lab support)
          if (slot.rooms && Array.isArray(slot.rooms)) {
            for (const r of slot.rooms) {
              if (!r) continue;
              const rId = typeof r === 'string' ? r : r.id || String(r.id || r.number || '');
              const rNumber = typeof r === 'object' ? (r.number ? String(r.number) : '') : '';
              if (rId === selectedRoom || rNumber === selectedRoom) { containsRoom = true; break; }
            }
          }

          // Check legacy single room field
          if (!containsRoom && slot.room) {
            if (typeof slot.room === 'string') {
              if (slot.room === selectedRoom) containsRoom = true;
            } else if (typeof slot.room === 'object') {
              const rId = slot.room.id ? String(slot.room.id) : '';
              const rNumber = slot.room.number ? String(slot.room.number) : '';
              if (rId === selectedRoom || rNumber === selectedRoom) containsRoom = true;
            }
          }
        }

        if (!containsRoom) {
          delete roomData[day][timeSlot];
        }
      }
    }
    
    setFilteredRoomData({
      ...selectedTimetable,
      data: roomData
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Room Type</Label>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="All Room Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Room Types</SelectItem>
                {roomTypes.map((type, idx) => (
                  <SelectItem key={idx} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Search by Room Number</Label>
            <Input 
              placeholder="Search rooms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label>Rooms</Label>
          <div className="mt-2 border rounded-md p-3 space-y-2 max-h-64 overflow-y-auto">
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <div key={room.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`room-${room.id}`}
                    name="selectedRoom"
                    value={String(room.id)}
                    checked={selectedRoom === String(room.id)}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="form-radio text-primary"
                  />
                  <Label htmlFor={`room-${room.id}`} className="text-sm font-normal cursor-pointer flex-1">
                    <div className="font-medium">{room.number}</div>
                    <div className="text-muted-foreground text-xs">{room.type}</div>
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No rooms available</p>
            )}
          </div>
        </div>
        
        <Button
          className="w-full"
            disabled={!selectedRoom}
          onClick={async () => {
              console.debug('View Room clicked', { selectedRoom, selectedTimetable });
              const fetched = await onApplyFilters(selectedRoom);
              // If parent returned a timetable, use it for filtering so the view is populated
              if (fetched) {
                handleViewRoomTimetable(fetched);
              } else {
                // fallback to existing selectedTimetable if available
                handleViewRoomTimetable();
              }
            }}
        >
          View Room Schedule
        </Button>
        
        {filteredRoomData && onExportTimetable && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => onExportTimetable('pdf', filteredRoomData, 'room', filteredRooms.find(r => r.id === selectedRoom)?.number, null)}>
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExportTimetable('excel', filteredRoomData, 'room', filteredRooms.find(r => r.id === selectedRoom)?.number)}>
              Export Excel
            </Button>
          </div>
        )}
      </div>

      {filteredRoomData && (
        <div className="py-4">
          <TimetableDisplay 
            timetableData={filteredRoomData.data} 
            viewType="room"
            showTeachers={true} 
            showRooms={false}
            showStreamInfo={true}
            roomId={selectedRoom}
          />
        </div>
      )}
    </div>
  );
};

export default RoomTimetableTab;
