
import { Calendar, Presentation, ListFilter, BookOpen, Database } from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";

export const FeatureCardsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <FeatureCard
        title="Create Timetables"
        description="Design new timetables for different streams and divisions"
        icon={<Calendar className="h-8 w-8" />}
        link="/timetable-editor"
      />
      <FeatureCard
        title="View & Export"
        description="View, filter and export created timetables"
        icon={<Presentation className="h-8 w-8" />}
        link="/view-timetables"
      />
      <FeatureCard
        title="Data Management"
        description="Manage subjects, teachers, and rooms"
        icon={<ListFilter className="h-8 w-8" />}
        link="/data-input"
      />
      <FeatureCard
        title="Streams & Divisions"
        description="Configure academic structure"
        icon={<BookOpen className="h-8 w-8" />}
        link="/streams-manager"
      />
    </div>
  );
};
