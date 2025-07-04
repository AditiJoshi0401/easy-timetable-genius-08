
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
  onApplyFilters: () => Promise<void>;
}

const RoomTimetableTab: React.FC<RoomTimetableTabProps> = ({
  selectedTimetable,
  onApplyFilters
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

  const handleViewRoomTimetable = () => {
    if (!selectedRoom || !selectedTimetable) return;
    
    // Filter the timetable data for the selected room
    const roomData = { ...selectedTimetable.data };
    
    // Process each day in the timetable
    for (const day in roomData) {
      // For each time slot in the day
      for (const timeSlot in roomData[day]) {
        const slot = roomData[day][timeSlot];
        
        // If the slot doesn't have the selected room, remove it
        if (!slot || 
            !slot.room || 
            (typeof slot.room === 'string' && slot.room !== selectedRoom) ||
            (typeof slot.room === 'object' && slot.room.id !== selectedRoom)) {
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
          <Label>Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger>
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent>
              {filteredRooms.length > 0 ? (
                filteredRooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.number} ({room.type})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-rooms-available" disabled>
                  No rooms available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full"
          disabled={!selectedRoom || !selectedTimetable}
          onClick={handleViewRoomTimetable}
        >
          View Room Schedule
        </Button>
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
