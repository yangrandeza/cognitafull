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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getClassWithStudentsAndProfiles } from "@/lib/firebase/firestore";
import type { ClassWithStudentData, UnifiedProfile, Student } from "@/lib/types";
import { Loader2, Share2 } from "lucide-react";
import {
  processProfiles,
  generateVarkData,
  generateDiscData,
  generateSchwartzData,
  generateDissonanceData,
  generateTeamData,
  generateClassProfileSummary
} from "@/lib/insights-generator";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";


export function InsightsDashboard({ classId }: { classId: string }) {
  const [data, setData] = useState<ClassWithStudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processedProfiles, setProcessedProfiles] = useState<UnifiedProfile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classData = await getClassWithStudentsAndProfiles(classId);
        setData(classData);
        if (classData && classData.profiles) {
            const profiles = processProfiles(classData.profiles);
            setProcessedProfiles(profiles);
        }
      } catch (error) {
        console.error("Failed to fetch class data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId]);
  
  const handleShareLink = () => {
    const url = `${window.location.origin}/q/${classId}`;
    navigator.clipboard.writeText(url);
    toast({
        title: "Link Copiado!",
        description: "O link de convite da turma foi copiado para sua área de transferência."
    })
  }

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
        <CardHeader>
            <CardTitle>Nenhum aluno respondeu ainda</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center text-muted-foreground space-y-4">
          <p>
            Compartilhe o link abaixo com seus alunos para que eles possam responder ao questionário e você possa começar a ver os insights.
          </p>
          <Button onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Copiar Link do Questionário
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { students } = data;
  
  const varkData = generateVarkData(processedProfiles);
  const discData = generateDiscData(processedProfiles);
  const schwartzData = generateSchwartzData(processedProfiles);
  const dissonanceData = generateDissonanceData(processedProfiles, students);
  const teamsData = generateTeamData(processedProfiles, students);
  const classProfileSummary = generateClassProfileSummary(processedProfiles);


  return (
    <Tabs defaultValue="insights" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
            <TabsTrigger value="insights">Visão Geral dos Insights</TabsTrigger>
            <TabsTrigger value="students">Lista de Alunos ({students.length})</TabsTrigger>
            <TabsTrigger value="optimizer">Otimizador de Aula com IA</TabsTrigger>
        </TabsList>
        <Button variant="outline" onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Copiar Link
        </Button>
      </div>

      <TabsContent value="insights" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="font-headline">Mapa de Perfis (DISC)</CardTitle>
              <CardDescription>Como a turma se distribui em termos de Dominância, Influência, Estabilidade (Steadiness) e Conformidade (Conscientiousness).</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <DiscChart data={discData} />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Estilos de Aprendizagem (VARK)</CardTitle>
               <CardDescription>A preferência da turma para aprender: Visual, Auditivo, Leitura/Escrita ou Cinestésico.</CardDescription>
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
        <StudentsList students={students} profiles={processedProfiles} />
      </TabsContent>
      <TabsContent value="optimizer">
        <LessonOptimizer classProfileSummary={classProfileSummary} />
      </TabsContent>
    </Tabs>
  );
}
