import { InsightsDashboard } from "@/components/class/insights-dashboard";
import { mockClasses } from "@/lib/mock-data";

export default function ClassDetailsPage({ params }: { params: { id: string } }) {
  const classData = mockClasses.find(c => c.id === params.id) || mockClasses[0];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {classData.name} - Insights
        </h1>
      </div>
      <InsightsDashboard classId={params.id} />
    </div>
  );
}
