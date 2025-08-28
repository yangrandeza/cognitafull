import { InsightsDashboard } from "@/components/class/insights-dashboard";
import { getClassById } from "@/lib/firebase/firestore";
import { AlertTriangle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClassDetailsPage({ params }: { params: { id: string } }) {
  const classData = await getClassById(params.id);

  if (!classData) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
             <Card className="text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 font-headline text-destructive">
                        <AlertTriangle />
                        Turma não encontrada
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>A turma que você está tentando acessar não existe ou você não tem permissão para visualizá-la.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight font-headline">
            {classData.name} - Insights
            </h1>
        </div>
      </div>
      <InsightsDashboard classId={params.id} />
    </div>
  );
}
