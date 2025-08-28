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
  // Em um aplicativo real, você buscaria dados com base no classId
  const insights = mockClassInsights;
  const students = mockStudents;

  return (
    <Tabs defaultValue="insights" className="space-y-4">
      <TabsList>
        <TabsTrigger value="insights">Visão Geral dos Insights</TabsTrigger>
        <TabsTrigger value="students">Lista de Alunos</TabsTrigger>
        <TabsTrigger value="optimizer">Otimizador de Aula com IA</TabsTrigger>
      </TabsList>
      <TabsContent value="insights" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
              <CardHeader>
                  <CardTitle className="font-headline">Mapa de Perfis DISC</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                  <DiscChart data={insights.disc} />
              </CardContent>
          </Card>
          <Card className="col-span-3">
              <CardHeader>
                  <CardTitle className="font-headline">Estilos de Aprendizagem VARK</CardTitle>
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
        <LessonOptimizer classProfileSummary="A turma é 40% Visual, 25% Auditiva. Alta concentração de perfis de Dominância (D) e Influência (I). Os valores principais são Benevolência e Autodireção." />
      </TabsContent>
    </Tabs>
  );
}
