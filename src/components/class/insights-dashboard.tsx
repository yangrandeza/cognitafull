"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VarkChart } from "@/components/class/vark-chart";
import { DiscChart } from "@/components/class/disc-chart";
import { SchwartzValues } from "@/components/class/schwartz-values";
import { DissonanceAlerts } from "@/components/class/dissonance-alerts";
import { SuggestedTeams } from "@/components/class/suggested-teams";
import { StudentsList } from "@/components/class/students-list";
import { LessonOptimizer } from "@/components/class/lesson-optimizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClassWithStudentsAndProfiles } from "@/lib/firebase/firestore";
import type { ClassWithStudentData, UnifiedProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import {
  generateVarkData,
  generateDiscData,
  generateSchwartzData,
  generateDissonanceData,
  generateTeamData,
  generateClassProfileSummary
} from "@/lib/insights-generator";


export function InsightsDashboard({ classId }: { classId: string }) {
  const [data, setData] = useState<ClassWithStudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classData = await getClassWithStudentsAndProfiles(classId);
        setData(classData);
      } catch (error) {
        console.error("Failed to fetch class data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Nenhum dado de aluno disponível para esta turma ainda. Envie o questionário para começar a gerar insights!
          </p>
        </CardContent>
      </Card>
    );
  }

  const { profiles, students } = data;
  
  const varkData = generateVarkData(profiles);
  const discData = generateDiscData(profiles);
  const schwartzData = generateSchwartzData(profiles);
  const dissonanceData = generateDissonanceData(profiles, students);
  const teamsData = generateTeamData(profiles, students);
  const classProfileSummary = generateClassProfileSummary(profiles);


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
              <DiscChart data={discData} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Estilos de Aprendizagem VARK</CardTitle>
            </CardHeader>
            <CardContent>
              <VarkChart data={varkData} />
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SchwartzValues data={schwartzData} />
          <DissonanceAlerts data={dissonanceData} />
          <SuggestedTeams data={teamsData} />
        </div>
      </TabsContent>
      <TabsContent value="students">
        <StudentsList students={students} />
      </TabsContent>
      <TabsContent value="optimizer">
        <LessonOptimizer classProfileSummary={classProfileSummary} />
      </TabsContent>
    </Tabs>
  );
}
