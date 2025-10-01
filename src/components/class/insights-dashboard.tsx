"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsList } from "@/components/class/students-list";
import { LessonOptimizer } from "@/components/class/lesson-optimizer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getClassById, getClassWithStudentsAndProfiles } from "@/lib/firebase/firestore";
import type { Class, ClassWithStudentData, UnifiedProfile, Student, RawUnifiedProfile, LearningStrategy } from "@/lib/types";
import { Loader2, Share2, Brain, Sparkles, Wind, Users, FileText, AlertTriangle, MessageSquare, Rabbit, Snail, Telescope, Mic, Cake, Baby, BookMarked, Play, Target, Heart, Zap, Clock, CheckCircle, Lightbulb, Users2, Gamepad2, Star, TrendingUp } from "lucide-react";
import { getDashboardData, processProfiles, getDemographicsData } from "@/lib/insights-generator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CognitiveCompass } from "./cognitive-compass";
import { InsightCard } from "./insight-card";
import { AnalysisCard } from "./analysis-card";
import { ShareClassDialog } from "./share-class-dialog";
import { SavedStrategies } from "@/components/class/saved-strategies";
import { ClassSettings } from "@/components/class/class-settings";
import { TeamFormation } from "./team-formation";
import { DissonanceAlerts } from "./dissonance-alerts";
import { getSavedLearningStrategies } from "@/lib/actions";


export function InsightsDashboard({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<Class | null>(null);
  const [studentData, setStudentData] = useState<{students: Student[], profiles: RawUnifiedProfile[]} | null>(null);
  const [savedStrategies, setSavedStrategies] = useState<LearningStrategy[]>([]);
  const [dashboardData, setDashboardData] = useState<ReturnType<typeof getDashboardData> | null>(null);
  const [demographicsData, setDemographicsData] = useState<ReturnType<typeof getDemographicsData> | null>(null);
  const [processedProfiles, setProcessedProfiles] = useState<UnifiedProfile[]>([]);
  const { toast } = useToast();
  const router = useRouter();


  const fetchClassData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch class details, student/profile data, and learning strategies in parallel
      const [fetchedClassData, fetchedStudentData, fetchedStrategies] = await Promise.all([
        getClassById(classId),
        getClassWithStudentsAndProfiles(classId),
        getSavedLearningStrategies(classId)
      ]);
      
      setClassData(fetchedClassData);
      setSavedStrategies(fetchedStrategies);

      if (fetchedStudentData) {
        setStudentData({students: fetchedStudentData.students, profiles: fetchedStudentData.profiles });
        const data = getDashboardData(fetchedStudentData.profiles, fetchedStudentData.students);
        setDashboardData(data);
        const demos = getDemographicsData(fetchedStudentData.students);
        setDemographicsData(demos);
        const profiles = processProfiles(fetchedStudentData.profiles);
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
    }
  }, [classId, toast]);

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);
  
  const handleStrategySaved = () => {
    // Re-fetch learning strategies and re-render
    getSavedLearningStrategies(classId).then(setSavedStrategies);
    toast({
        title: "Estratégia salva!",
        description: "Sua nova estratégia de aprendizagem foi salva. Verifique a aba 'Estratégias'.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasStudents = studentData && studentData.students.length > 0;

  if (!dashboardData || !classData) {
    return <p>Erro ao gerar os dados do painel.</p>
  }

  const students = studentData?.students || [];
  const { teacherId } = classData;
  const { compassData, insightCards, classProfileSummary, teamsData, dissonanceData, communicationData, workPaceData } = dashboardData;

  // Generate generational insights based on dominant generation
  const getGenerationalInsights = (generation: string): string => {
    switch (generation) {
      case 'Alpha':
        return 'Geração conectada digitalmente. Prefere aprendizado interativo, gamificado e com tecnologia integrada.';
      case 'Gen Z':
        return 'Nativos digitais com foco em autenticidade. Valorizam propósito, diversidade e aprendizado prático.';
      case 'Millennial':
        return 'Buscam equilíbrio trabalho-vida. Preferem colaboração, feedback frequente e aprendizado autodirigido.';
      case 'Gen X':
        return 'Independentes e pragmáticos. Valorizam eficiência, resultados práticos e respeito à autoridade estabelecida.';
      case 'Boomer':
        return 'Orientados para carreira e estabilidade. Preferem estrutura, experiência prática e aplicações do mundo real.';
      case 'Silent':
        return 'Valorizam tradição e trabalho em equipe. Preferem aprendizado sequencial e respeito às normas estabelecidas.';
      default:
        return 'Adapte as estratégias pedagógicas considerando as características etárias e experiências de vida do grupo.';
    }
  };

  // Generate perfect lesson plan based on all class data (formatted version)
  const generatePerfectLessonPlanFormatted = (dashboardData: any, demographicsData: any): Array<{title: string, description: string, icon: React.ReactNode}> => {
    if (!dashboardData || !demographicsData) return [{ title: "Dados insuficientes", description: "Não há dados suficientes para gerar um plano de aula personalizado.", icon: <AlertTriangle className="h-4 w-4" /> }];

    const { compassData, communicationData, workPaceData, dissonanceData } = dashboardData;
    const { dominantGeneration } = demographicsData;

    const planItems: Array<{title: string, description: string, icon: React.ReactNode}> = [];

    // 1. Opening/Engagement Strategy based on compass and generation
    if (compassData) {
      const socialScore = compassData.find((d: any) => d.axis === "Interação Social")?.value || 50;
      const energyScore = compassData.find((d: any) => d.axis === "Fonte de Energia")?.value || 50;

      if (socialScore > 60) {
        planItems.push({
          title: "Abertura colaborativa",
          description: "Comece com atividade em grupo para energizar a turma social e promover interação imediata.",
          icon: <Users2 className="h-4 w-4" />
        });
      } else {
        planItems.push({
          title: "Abertura reflexiva",
          description: "Inicie com momento individual de reflexão antes da interação em grupo.",
          icon: <Brain className="h-4 w-4" />
        });
      }

      if (energyScore > 60) {
        planItems.push({
          title: "Gancho motivacional",
          description: "Conecte o tema com propósito maior e impacto comunitário para despertar engajamento.",
          icon: <Star className="h-4 w-4" />
        });
      } else {
        planItems.push({
          title: "Gancho competitivo",
          description: "Use desafio e metas claras para despertar interesse e motivação competitiva.",
          icon: <Target className="h-4 w-4" />
        });
      }
    }

    // 2. Communication Strategy
    if (communicationData) {
      if (communicationData.style === 'Relacional') {
        planItems.push({
          title: "Comunicação empática",
          description: "Use storytelling e considere contexto emocional dos alunos em todas as interações.",
          icon: <Heart className="h-4 w-4" />
        });
      } else {
        planItems.push({
          title: "Comunicação objetiva",
          description: "Foque em fatos, dados e clareza lógica para transmitir informações de forma direta.",
          icon: <FileText className="h-4 w-4" />
        });
      }

      if (communicationData.feedback === 'Empático') {
        planItems.push({
          title: "Feedback emocional",
          description: "Elogie esforços e progresso pessoal, considerando o impacto emocional das observações.",
          icon: <MessageSquare className="h-4 w-4" />
        });
      } else {
        planItems.push({
          title: "Feedback direto",
          description: "Forneça correções específicas e acionáveis baseadas em observações concretas.",
          icon: <CheckCircle className="h-4 w-4" />
        });
      }
    }

    // 3. Pace and Structure Strategy
    if (workPaceData) {
      if (workPaceData.pace === 'Rápido') {
        planItems.push({
          title: "Ritmo dinâmico",
          description: "Alterne atividades curtas e varie o foco frequentemente para manter o engajamento.",
          icon: <Zap className="h-4 w-4" />
        });
      } else {
        planItems.push({
          title: "Ritmo cadenciado",
          description: "Permita tempo adequado para processamento e reflexão entre atividades.",
          icon: <Clock className="h-4 w-4" />
        });
      }

      if (workPaceData.focus === 'Visão Geral') {
        planItems.push({
          title: "Abordagem holística",
          description: "Comece com visão geral do tema antes de mergulhar nos detalhes específicos.",
          icon: <Telescope className="h-4 w-4" />
        });
      } else {
        planItems.push({
          title: "Abordagem detalhada",
          description: "Construa compreensão passo a passo, focando nos detalhes fundamentais.",
          icon: <Lightbulb className="h-4 w-4" />
        });
      }
    }

    // 4. Generational Strategy
    const genStrategies = getGenerationalStrategies(dominantGeneration);
    planItems.push(...genStrategies);

    // 5. Dissonance Mitigation
    if (dissonanceData && dissonanceData.length > 0) {
      planItems.push({
        title: "Atenção especial",
        description: "Monitore alunos com possíveis conflitos de perfil e adapte estratégias conforme necessário.",
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    // 6. Closing Strategy
    planItems.push({
      title: "Encerramento reflexivo",
      description: "Termine conectando o aprendizado com aplicações práticas do mundo real.",
      icon: <TrendingUp className="h-4 w-4" />
    });

    planItems.push({
      title: "Feedback contínuo",
      description: "Incentive reflexão pessoal sobre o processo de aprendizagem e crescimento individual.",
      icon: <Play className="h-4 w-4" />
    });

    return planItems;
  };

  // Helper function for generational teaching strategies
  const getGenerationalStrategies = (generation: string): Array<{title: string, description: string, icon: React.ReactNode}> => {
    switch (generation) {
      case 'Alpha':
        return [{
          title: "Tecnologia integrada",
          description: "Use apps, jogos e ferramentas digitais durante toda a aula para manter o engajamento.",
          icon: <Gamepad2 className="h-4 w-4" />
        }];
      case 'Gen Z':
        return [{
          title: "Autenticidade",
          description: "Conecte conteúdo com questões sociais e permita expressão pessoal e criativa.",
          icon: <Star className="h-4 w-4" />
        }];
      case 'Millennial':
        return [{
          title: "Colaboração",
          description: "Inclua trabalho em equipe e oportunidades de liderança compartilhada.",
          icon: <Users2 className="h-4 w-4" />
        }];
      case 'Gen X':
        return [{
          title: "Praticidade",
          description: "Foque em aplicações reais e demonstre valor prático do conhecimento adquirido.",
          icon: <Target className="h-4 w-4" />
        }];
      case 'Boomer':
        return [{
          title: "Estrutura clara",
          description: "Forneça roteiro detalhado e conexões com carreira profissional e aplicações práticas.",
          icon: <FileText className="h-4 w-4" />
        }];
      case 'Silent':
        return [{
          title: "Respeito tradicional",
          description: "Mantenha decoro e enfatize trabalho em equipe cooperativo e valores tradicionais.",
          icon: <BookMarked className="h-4 w-4" />
        }];
      default:
        return [{
          title: "Adaptação contextual",
          description: "Considere experiências de vida dos alunos no planejamento pedagógico.",
          icon: <Lightbulb className="h-4 w-4" />
        }];
    }
  };

  return (
    <Tabs defaultValue="insights" className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
            <TabsTrigger value="insights">Mosaico de aprendizagem</TabsTrigger>
            <TabsTrigger value="students">Alunos ({students.length})</TabsTrigger>
            <TabsTrigger value="strategies">Estratégias</TabsTrigger>
            <TabsTrigger value="optimizer">Oráculo pedagógico</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        <ShareClassDialog classId={classId} />
      </div>

      <TabsContent value="insights" className="space-y-6">
        {!hasStudents ? (
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Sua turma ainda está vazia</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-center text-muted-foreground space-y-4">
              <p>
                Para começar a ver os insights, compartilhe o link do questionário com seus alunos. Assim que eles responderem, o mosaico de aprendizagem aparecerá aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {demographicsData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Idade média</CardTitle>
                <Cake className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demographicsData.averageAge.toFixed(1)} anos</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Geração predominante</CardTitle>
                <Baby className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demographicsData.dominantGeneration}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gênero predominante</CardTitle>
                 <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demographicsData.dominantGender}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insights geracionais</CardTitle>
                <BookMarked className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {getGenerationalInsights(demographicsData.dominantGeneration)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">A bússola cognitiva da turma</CardTitle>
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
                title="O clima da sala 🌡️"
                subtitle="Como eles se sentem mais confortáveis para aprender?"
                text={insightCards.climate}
            />
            <InsightCard
                icon={<Sparkles className="h-8 w-8 text-amber-500" />}
                title="A faísca do engajamento ✨"
                subtitle="O que os faz inclinar para a frente na cadeira?"
                text={insightCards.engagement}
            />
            <InsightCard
                icon={<Brain className="h-8 w-8 text-violet-500" />}
                title="A melhor forma de explicação 🧠"
                subtitle="Qual abordagem de ensino ressoará mais forte?"
                text={insightCards.explanation}
            />
        </div>
         <div className="grid gap-6 md:grid-cols-2">
            {communicationData && (
                <AnalysisCard
                    icon={<MessageSquare className="h-8 w-8 text-green-500" />}
                    title="Comunicação e feedback"
                    subtitle="Como se comunicar e dar feedback para esta turma?"
                    category1Title="Estilo de comunicação"
                    category1Value={communicationData.style}
                    category1Icon={communicationData.style === 'Relacional' ? <Users className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    category2Title="Estilo de feedback"
                    category2Value={communicationData.feedback}
                    category2Icon={communicationData.feedback === 'Empático' ? <Brain className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    text={communicationData.recommendation}
                />
            )}
            {workPaceData && (
                 <AnalysisCard
                    icon={<Telescope className="h-8 w-8 text-cyan-500" />}
                    title="Ritmo de trabalho e foco"
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

        <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-green-50/30">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <BookMarked className="h-8 w-8 text-emerald-600" />
                    <div>
                        <CardTitle className="text-xl text-emerald-800">Aula perfeita para sua turma 🎯</CardTitle>
                        <CardDescription className="text-emerald-600">
                            Plano personalizado baseado em todos os dados da turma
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {generatePerfectLessonPlanFormatted(dashboardData, demographicsData).map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-emerald-100">
                            <div className="p-1 bg-emerald-100 rounded-md flex-shrink-0 mt-0.5">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-emerald-800 text-sm">{item.title}</div>
                                <div className="text-emerald-700 text-sm mt-1">{item.description}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <TeamFormation students={students} profiles={processedProfiles} />

        <DissonanceAlerts
          dissonanceData={dissonanceData}
          students={students}
          profiles={processedProfiles}
        />
          </>
        )}
      </TabsContent>
      <TabsContent value="students">
        <StudentsList students={students} profiles={processedProfiles} classId={classId} />
      </TabsContent>
       <TabsContent value="strategies">
        <SavedStrategies savedStrategies={savedStrategies} />
      </TabsContent>
      <TabsContent value="optimizer">
        <LessonOptimizer
            classProfileSummary={classProfileSummary}
            classId={classId}
            teacherId={teacherId}
            onStrategySaved={handleStrategySaved}
        />
      </TabsContent>
      <TabsContent value="settings">
        <ClassSettings classId={classId} className={classData.name} />
      </TabsContent>
    </Tabs>
  );
}
