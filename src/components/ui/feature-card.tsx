
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
}

export function FeatureCard({ title, description, icon, link }: FeatureCardProps) {
  const content = (
    <Card className={`overflow-hidden transition-all ${link ? 'hover:shadow-md hover:border-primary/20' : ''}`}>
      <CardContent className="p-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}
