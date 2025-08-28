
"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsList } from "@/components/class/students-list";
import { LessonOptimizer } from "@/components/class/lesson-optimizer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getClassWithStudentsAndProfiles } from "@/lib/firebase/firestore";
import type { ClassWithStudentData, UnifiedProfile, Student } from "@/lib/types";
import { Loader2, Share2, Brain, Sparkles, Wind, Users, FileText } from "lucide-react";
import { getDashboardData } from "@/lib/insights-generator";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { CognitiveCompass } from "./cognitive-compass"; // New component for the radar chart
import { InsightCard } from "./insight-card"; // New component for the insight cards


export function InsightsDashboard({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassWithStudentData | null>(null);
  const [dashboardData, setDashboardData] = useState<ReturnType<typeof getDashboardData> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedClassData = await getClassWithStudentsAndProfiles(classId);
        setClassData(fetchedClassData);
        if (fetchedClassData && fetchedClassData.profiles) {
            const data = getDashboardData(fetchedClassData.profiles, fetchedClassData.students);
            setDashboardData(data);
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

  if (!classData || classData.students.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Sua turma ainda está vazia</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center text-muted-foreground space-y-4">
          <p>
            Para começar a ver os insights, compartilhe o link do questionário com seus alunos. Assim que eles responderem, o Mosaico de Aprendizagem aparecerá aqui.
          </p>
          <Button onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Copiar Link do Questionário
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return <p>Erro ao gerar os dados do painel.</p>
  }
  
  const { students } = classData;
  const { compassData, insightCards, classProfileSummary } = dashboardData;

  return (
    <Tabs defaultValue="insights" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
            <TabsTrigger value="insights">Mosaico de Aprendizagem</TabsTrigger>
            <TabsTrigger value="students">Alunos ({students.length})</TabsTrigger>
            <TabsTrigger value="optimizer">Oráculo Pedagógico</TabsTrigger>
        </TabsList>
        <Button variant="outline" onClick={handleShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Copiar Link
        </Button>
      </div>

      <TabsContent value="insights" className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">A Bússola Cognitiva da Turma</CardTitle>
                <CardDescription>
                    Esta é a "personalidade" da sua turma. O formato do gráfico mostra rapidamente as tendências gerais do grupo, ajudando você a adaptar suas aulas de forma intuitiva.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {compassData && <CognitiveCompass data={compassData} />}
            </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-3">
            <InsightCard 
                icon={<Wind className="h-8 w-8 text-blue-500" />}
                title="O Clima da Sala 🌡️"
                subtitle="Como eles se sentem mais confortáveis para aprender?"
                text={insightCards.climate}
            />
            <InsightCard 
                icon={<Sparkles className="h-8 w-8 text-amber-500" />}
                title="A Faísca do Engajamento ✨"
                subtitle="O que os faz inclinar para a frente na cadeira?"
                text={insightCards.engagement}
            />
            <InsightCard 
                icon={<Brain className="h-8 w-8 text-violet-500" />}
                title="A Melhor Forma de Explicar 🧠"
                subtitle="Qual abordagem de ensino ressoará mais forte?"
                text={insightCards.explanation}
            />
        </div>
        
        {/* Keeping these for now, can be integrated into a new "Advanced" tab or removed */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 hidden">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users />
                        Sugestão de Equipes
                    </CardTitle>
                    <CardDescription>Agrupe alunos por perfis complementares para otimizar o trabalho em equipe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {dashboardData.teamsData.map((team, index) => (
                    <div key={index}>
                        <p className="font-semibold">{team.category}</p>
                        <p className="text-xs text-muted-foreground mb-1">{team.description}</p>
                        <p className="text-sm text-foreground/80">{team.students.join(', ')}</p>
                    </div>
                    ))}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users />
                        Alertas de Dissonância
                    </CardTitle>
                     <CardDescription>Alunos com perfis conflitantes, que podem gastar mais energia para se adaptar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dashboardData.dissonanceData.map((alert, index) => (
                    <div key={index} className="p-3 bg-destructive/10 rounded-lg">
                        <p className="font-semibold text-destructive">{alert.studentName}</p>
                        <p className="text-sm text-destructive/80">{alert.note}</p>
                    </div>
                    ))}
                </CardContent>
            </Card>
        </div>

      </TabsContent>
      <TabsContent value="students">
        <StudentsList students={students} profiles={classData.profiles} />
      </TabsContent>
      <TabsContent value="optimizer">
        <LessonOptimizer classProfileSummary={classProfileSummary} />
      </TabsContent>
    </Tabs>
  );
}
