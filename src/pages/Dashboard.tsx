
import { useState, useEffect } from "react";
import { LayoutDashboard } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { SetupProgressCard } from "@/components/dashboard/SetupProgressCard";
import { RecentTimetablesCard } from "@/components/dashboard/RecentTimetablesCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { FeatureCardsSection } from "@/components/dashboard/FeatureCardsSection";

const Dashboard = () => {
  const [subjectCount, setSubjectCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [streamCount, setStreamCount] = useState(0);
  const [divisionCount, setDivisionCount] = useState(0);
  const [timetableCount, setTimetableCount] = useState(0);
  const [recentTimetables, setRecentTimetables] = useState<any[]>([]);

  useEffect(() => {
    // Load counts from localStorage
    try {
      const subjects = localStorage.getItem('subjects');
      const teachers = localStorage.getItem('teachers');
      const rooms = localStorage.getItem('rooms');
      const streams = localStorage.getItem('streams');
      const divisions = localStorage.getItem('divisions');
      const recentTimetablesData = localStorage.getItem('recentTimetables');
      
      if (subjects) setSubjectCount(JSON.parse(subjects).length);
      if (teachers) setTeacherCount(JSON.parse(teachers).length);
      if (rooms) setRoomCount(JSON.parse(rooms).length);
      if (streams) setStreamCount(JSON.parse(streams).length);
      if (divisions) setDivisionCount(JSON.parse(divisions).length);
      
      if (recentTimetablesData) {
        const parsedTimetables = JSON.parse(recentTimetablesData);
        setRecentTimetables(parsedTimetables);
        setTimetableCount(parsedTimetables.length);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Calculate setup progress
  const calculateSetupProgress = () => {
    let progress = 0;
    if (subjectCount > 0) progress += 20;
    if (teacherCount > 0) progress += 20;
    if (roomCount > 0) progress += 20;
    if (streamCount > 0) progress += 20;
    if (divisionCount > 0) progress += 20;
    return progress;
  };

  // Get current date string
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Dashboard"
        description="Welcome to your timetable management dashboard"
        icon={<LayoutDashboard className="h-6 w-6" />}
      />

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <OverviewCard
          subjectCount={subjectCount}
          teacherCount={teacherCount}
          roomCount={roomCount}
          streamCount={streamCount}
          divisionCount={divisionCount}
          timetableCount={timetableCount}
          currentDate={getCurrentDate()}
        />

        <SetupProgressCard
          subjectCount={subjectCount}
          teacherCount={teacherCount}
          roomCount={roomCount}
          streamCount={streamCount}
          divisionCount={divisionCount}
          setupProgress={calculateSetupProgress()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTimetablesCard recentTimetables={recentTimetables} />
        <QuickActionsCard />
      </div>

      <FeatureCardsSection />
    </div>
  );
};

export default Dashboard;
