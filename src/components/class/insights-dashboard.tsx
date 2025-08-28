"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VarkChart } from "@/components/class/vark-chart";
import { DiscChart } from "@/components/class/disc-chart";
import { SchwartzValues } from "@/components/class/schwartz-values";
import { DissonanceAlerts } from "@/components/class/dissonance-alerts";
import { SuggestedTeams } from "@/components/class/suggested-teams";
import { StudentsList } from "@/components/class/students-list";
import { LessonOptimizer } from "@/components/class/lesson-optimizer";
import { mockClassInsights, mockStudents } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InsightsDashboard({ classId }: { classId: string }) {
  // In a real app, you would fetch data based on classId
  const insights = mockClassInsights;
  const students = mockStudents;

  return (
    <Tabs defaultValue="insights" className="space-y-4">
      <TabsList>
        <TabsTrigger value="insights">Insights Overview</TabsTrigger>
        <TabsTrigger value="students">Students List</TabsTrigger>
        <TabsTrigger value="optimizer">AI Lesson Optimizer</TabsTrigger>
      </TabsList>
      <TabsContent value="insights" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
              <CardHeader>
                  <CardTitle className="font-headline">DISC Profile Map</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                  <DiscChart data={insights.disc} />
              </CardContent>
          </Card>
          <Card className="col-span-3">
              <CardHeader>
                  <CardTitle className="font-headline">VARK Learning Styles</CardTitle>
              </CardHeader>
              <CardContent>
                  <VarkChart data={insights.vark} />
              </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SchwartzValues data={insights.schwartz} />
            <DissonanceAlerts data={insights.dissonance} />
            <SuggestedTeams data={insights.teams} />
        </div>
      </TabsContent>
      <TabsContent value="students">
        <StudentsList students={students} />
      </TabsContent>
      <TabsContent value="optimizer">
        <LessonOptimizer classProfileSummary="The class is 40% Visual, 25% Auditory. High concentration of Dominance (D) and Influence (I) profiles. Key values are Benevolence and Autodirection." />
      </TabsContent>
    </Tabs>
  );
}
