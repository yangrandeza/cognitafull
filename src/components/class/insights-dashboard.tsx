
"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsList } from "@/components/class/students-list";
import { LessonOptimizer } from "@/components/class/lesson-optimizer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getClassById, getClassWithStudentsAndProfiles } from "@/lib/firebase/firestore";
import type { Class, ClassWithStudentData, UnifiedProfile, Student, RawUnifiedProfile, LessonPlan } from "@/lib/types";
import { Loader2, Share2, Brain, Sparkles, Wind, Users, FileText, AlertTriangle, MessageSquare, Rabbit, Snail, Telescope, Mic, Cake, Baby, BookMarked } from "lucide-react";
import { getDashboardData, processProfiles, getDemographicsData } from "@/lib/insights-generator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CognitiveCompass } from "./cognitive-compass";
import { InsightCard } from "./insight-card";
import { AnalysisCard } from "./analysis-card";
import { ShareClassDialog } from "./share-class-dialog";
import { SavedLessonPlans } from "./saved-lesson-plans";
import { getSavedLessonPlans } from "@/lib/actions";


export function InsightsDashboard({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassWithStudentData | null>(null);
  const [dashboardData, setDashboardData] = useState<ReturnType<typeof getDashboardData> | null>(null);
  const [demographicsData, setDemographicsData] = useState<ReturnType<typeof getDemographicsData> | null>(null);
  const [processedProfiles, setProcessedProfiles] = useState<UnifiedProfile[]>([]);
  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const { toast } = useToast();

  const fetchClassData = useCallback(async () => {
    setLoading(true);
    setLoadingPlans(true);
    try {
      const [fetchedClassData, fetchedPlans] = await Promise.all([
        getClassWithStudentsAndProfiles(classId),
        getSavedLessonPlans(classId)
      ]);
      
      setClassData(fetchedClassData);
      setSavedPlans(fetchedPlans);

      if (fetchedClassData && fetchedClassData.profiles) {
          const data = getDashboardData(fetchedClassData.profiles, fetchedClassData.students);
          setDashboardData(data);
          const demos = getDemographicsData(fetchedClassData.students);
          setDemographicsData(demos);
          const profiles = processProfiles(fetchedClassData.profiles);
          setProcessedProfiles(profiles);
      }
    } catch (error) {
      console.error("Failed to fetch class data:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados da turma.'
      })
    } finally {
      setLoading(false);
      setLoadingPlans(false);
    }
  }, [classId, toast]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);
  
  const handlePlanSaved = (newPlan: LessonPlan) => {
    setSavedPlans(prevPlans => [newPlan, ...prevPlans]);
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
          <ShareClassDialog classId={classId} />
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return <p>Erro ao gerar os dados do painel.</p>
  }
  
  const { students, teacherId } = classData;
  const { compassData, insightCards, classProfileSummary, teamsData, dissonanceData, communicationData, workPaceData } = dashboardData;

  return (
    <Tabs defaultValue="insights" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
            <TabsTrigger value="insights">Mosaico de Aprendizagem</TabsTrigger>
            <TabsTrigger value="students">Alunos ({students.length})</TabsTrigger>
            <TabsTrigger value="plans">Planos de Aula</TabsTrigger>
            <TabsTrigger value="optimizer">Oráculo Pedagógico</TabsTrigger>
        </TabsList>
        <ShareClassDialog classId={classId} />
      </div>

      <TabsContent value="insights" className="space-y-6">

        {demographicsData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Idade Média</CardTitle>
                <Cake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demographicsData.averageAge.toFixed(1)} anos</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geração Predominante</CardTitle>
                <Baby className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demographicsData.dominantGeneration}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gênero Predominante</CardTitle>
                 <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demographicsData.dominantGender}</div>
              </CardContent>
            </Card>
          </div>
        )}

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
                title="A Melhor Forma de Explicação 🧠"
                subtitle="Qual abordagem de ensino ressoará mais forte?"
                text={insightCards.explanation}
            />
        </div>
         <div className="grid gap-6 md:grid-cols-2">
            {communicationData && (
                <AnalysisCard
                    icon={<MessageSquare className="h-8 w-8 text-green-500" />}
                    title="Comunicação e Feedback"
                    subtitle="Como se comunicar e dar feedback para esta turma?"
                    category1Title="Estilo de Comunicação"
                    category1Value={communicationData.style}
                    category1Icon={communicationData.style === 'Relacional' ? <Users className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    category2Title="Estilo de Feedback"
                    category2Value={communicationData.feedback}
                    category2Icon={communicationData.feedback === 'Empático' ? <Brain className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    text={communicationData.recommendation}
                />
            )}
            {workPaceData && (
                 <AnalysisCard
                    icon={<Telescope className="h-8 w-8 text-cyan-500" />}
                    title="Ritmo de Trabalho e Foco"
                    subtitle="Como a turma aborda as tarefas?"
                    category1Title="Ritmo"
                    category1Value={workPaceData.pace}
                    category1Icon={workPaceData.pace === 'Rápido' ? <Rabbit className="h-5 w-5" /> : <Snail className="h-5 w-5" />}
                    category2Title="Foco"
                    category2Value={workPaceData.focus}
                    category2Icon={workPaceData.focus === 'Visão Geral' ? <Telescope className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    text={workPaceData.recommendation}
                />
            )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Users />
                        Como formar equipes equilibradas?
                    </CardTitle>
                    <CardDescription>Agrupe alunos por perfis complementares para otimizar o trabalho em equipe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {teamsData.map((team, index) => (
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
                    <CardTitle className="font-headline flex items-center gap-2 text-amber-600">
                        <AlertTriangle />
                        Quem precisa de mais atenção?
                    </CardTitle>
                     <CardDescription>Alunos com perfis potencialmente conflitantes, que podem gastar mais energia para se adaptar às atividades do dia a dia.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                     {dissonanceData.length > 0 ? dissonanceData.map((alert, index) => (
                        <div key={index} className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <p className="font-semibold text-amber-700">{alert.studentName}</p>
                            <p className="text-sm text-amber-600/80">{alert.note}</p>
                        </div>
                        )) : (
                        <p className="text-center text-muted-foreground">Nenhum ponto de dissonância notável encontrado na turma.</p>
                    )}
                </CardContent>
            </Card>
        </div>

      </TabsContent>
      <TabsContent value="students">
        <StudentsList students={students} profiles={processedProfiles} />
      </TabsContent>
       <TabsContent value="plans">
        <SavedLessonPlans 
          savedPlans={savedPlans}
          isLoading={loadingPlans}
        />
      </TabsContent>
      <TabsContent value="optimizer">
        <LessonOptimizer 
            classProfileSummary={classProfileSummary} 
            classId={classId} 
            teacherId={teacherId}
            onPlanSaved={handlePlanSaved}
        />
      </TabsContent>
    </Tabs>
  );
}
