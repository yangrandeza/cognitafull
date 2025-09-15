"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, BookOpen, TrendingUp, Target, BarChart3, PieChart, Activity, Award } from "lucide-react";
import { getClassesByOrganization, getClassWithStudentsAndProfiles } from "@/lib/firebase/firestore";
import { getDashboardData, getDemographicsData } from "@/lib/insights-generator";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { Class, RawUnifiedProfile, Student } from "@/lib/types";

export function OrganizationInsights() {
  const { userProfile } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [organizationData, setOrganizationData] = useState<{
    classes: Class[];
    totalClasses: number;
    totalStudents: number;
    totalResponses: number;
    completionRate: number;
    demographics: any;
    insights: any;
    classBreakdown: any[];
    diversityMetrics: any;
  } | null>(null);

  useEffect(() => {
    const fetchOrganizationInsights = async () => {
      if (!userProfile?.organizationId) return;

      setLoading(true);
      try {
        // Get all classes in the organization
        const classes = await getClassesByOrganization(userProfile.organizationId);

        if (classes.length === 0) {
          setOrganizationData({
            classes: [],
            totalClasses: 0,
            totalStudents: 0,
            totalResponses: 0,
            completionRate: 0,
            demographics: null,
            insights: null,
            classBreakdown: [],
            diversityMetrics: null
          });
          setLoading(false);
          return;
        }

        // Get detailed data for all classes
        const classesWithData = await Promise.all(
          classes.map(classItem => getClassWithStudentsAndProfiles(classItem.id))
        );

        // Aggregate all profiles and students
        const allProfiles: RawUnifiedProfile[] = [];
        const allStudents: Student[] = [];

        // Create class breakdown for comparative analysis
        const classBreakdown = classesWithData.map((classData, index) => {
          if (!classData) return null;

          const classInfo = classes[index];
          const profiles = classData.profiles || [];
          const students = classData.students || [];

          allProfiles.push(...profiles);
          allStudents.push(...students);

          return {
            id: classInfo.id,
            name: classInfo.name,
            teacherId: classInfo.teacherId,
            studentCount: classInfo.studentCount,
            responsesCount: classInfo.responsesCount,
            completionRate: classInfo.studentCount > 0 ? (classInfo.responsesCount / classInfo.studentCount) * 100 : 0,
            profiles: profiles,
            students: students
          };
        }).filter(Boolean);

        // Calculate organization-wide metrics
        const totalClasses = classes.length;
        const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
        const totalResponses = classes.reduce((sum, cls) => sum + cls.responsesCount, 0);
        const completionRate = totalStudents > 0 ? (totalResponses / totalStudents) * 100 : 0;

        // Get demographics and insights
        const demographics = getDemographicsData(allStudents);
        const insights = allProfiles.length > 0 ? getDashboardData(allProfiles, allStudents) : null;

        // Calculate diversity metrics across classes
        const diversityMetrics = calculateDiversityMetrics(classBreakdown, allStudents);

        setOrganizationData({
          classes,
          totalClasses,
          totalStudents,
          totalResponses,
          completionRate,
          demographics,
          insights,
          classBreakdown,
          diversityMetrics
        });

      } catch (error) {
        console.error("Error fetching organization insights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationInsights();
  }, [userProfile]);

  // Helper function to calculate diversity metrics
  const calculateDiversityMetrics = (classBreakdown: any[], allStudents: Student[]) => {
    if (!classBreakdown.length) return null;

    // Calculate completion rate variance
    const completionRates = classBreakdown.map(cls => cls.completionRate);
    const avgCompletion = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - avgCompletion, 2), 0) / completionRates.length;
    const stdDev = Math.sqrt(variance);

    // Calculate class size distribution
    const classSizes = classBreakdown.map(cls => cls.studentCount);
    const avgClassSize = classSizes.reduce((sum, size) => sum + size, 0) / classSizes.length;

    // Calculate response distribution
    const responseRates = classBreakdown.map(cls => cls.responsesCount);
    const totalResponses = responseRates.reduce((sum, responses) => sum + responses, 0);
    const avgResponseRate = totalResponses / classBreakdown.length;

    return {
      completionRateVariance: stdDev,
      avgCompletionRate: avgCompletion,
      avgClassSize,
      avgResponseRate,
      classSizeRange: {
        min: Math.min(...classSizes),
        max: Math.max(...classSizes)
      },
      completionRateRange: {
        min: Math.min(...completionRates),
        max: Math.max(...completionRates)
      }
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Não foi possível carregar os dados organizacionais.
      </div>
    );
  }

  const { totalClasses, totalStudents, totalResponses, completionRate, demographics, insights, classBreakdown, diversityMetrics } = organizationData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Insights organizacionais</h2>
          <p className="text-muted-foreground">
            Análise estratégica dos perfis de aprendizagem em toda a instituição
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Resumo Executivo
          </CardTitle>
          <CardDescription>
            Visão geral do panorama de aprendizagem da sua instituição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Estrutura</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalClasses}</p>
              <p className="text-xs text-muted-foreground">turmas ativas</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Cobertura</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">alunos matriculados</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Engajamento</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{completionRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">taxa de resposta</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Insights</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{totalResponses}</p>
              <p className="text-xs text-muted-foreground">perfis analisados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="diversity">Diversidade</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="strategies">Estratégias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Demographics */}
          {demographics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Users className="h-5 w-5" />
                  Perfil Demográfico Institucional
                </CardTitle>
                <CardDescription>
                  Características gerais da população estudantil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Idade média</p>
                    <p className="text-3xl font-bold">{demographics.averageAge?.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">anos</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Gênero predominante</p>
                    <p className="text-3xl font-bold">{demographics.dominantGender || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">maioria</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Geração predominante</p>
                    <Badge variant="secondary" className="text-lg px-3 py-1 mt-2">
                      {demographics.dominantGeneration || "N/A"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Learning Compass */}
          {insights?.compassData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Target className="h-5 w-5" />
                  Bússola de Aprendizagem Institucional
                </CardTitle>
                <CardDescription>
                  Tendências predominantes nos estilos de aprendizagem da instituição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.compassData.map((axis: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{axis.axis}</span>
                        <span className="text-sm font-bold text-primary">{axis.value.toFixed(0)}%</span>
                      </div>
                      <Progress value={axis.value} className="h-3" />
                      <p className="text-xs text-muted-foreground">
                        {axis.value > 70 ? "Tendência muito forte" :
                         axis.value > 50 ? "Tendência moderada" :
                         axis.value > 30 ? "Tendência leve" : "Tendência baixa"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="diversity" className="space-y-4">
          {/* Diversity Metrics */}
          {diversityMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <PieChart className="h-5 w-5" />
                  Métricas de Diversidade Organizacional
                </CardTitle>
                <CardDescription>
                  Análise da distribuição e variabilidade entre turmas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Variação na Taxa de Conclusão</p>
                    <p className="text-2xl font-bold">{diversityMetrics.completionRateVariance.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">
                      Desvio padrão entre turmas
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tamanho Médio das Turmas</p>
                    <p className="text-2xl font-bold">{diversityMetrics.avgClassSize.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">
                      alunos por turma
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Intervalos Observados</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Tamanho das turmas</p>
                      <p className="text-sm font-medium">
                        {diversityMetrics.classSizeRange.min} - {diversityMetrics.classSizeRange.max} alunos
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de conclusão</p>
                      <p className="text-sm font-medium">
                        {diversityMetrics.completionRateRange.min.toFixed(0)}% - {diversityMetrics.completionRateRange.max.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Class Comparison */}
          {classBreakdown && classBreakdown.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <BarChart3 className="h-5 w-5" />
                  Comparativo entre Turmas
                </CardTitle>
                <CardDescription>
                  Performance relativa de cada turma na instituição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classBreakdown.map((classData: any, index: number) => (
                    <div key={classData.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{classData.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {classData.responsesCount}/{classData.studentCount} alunos
                        </span>
                      </div>
                      <Progress value={classData.completionRate} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {classData.completionRate.toFixed(1)}% de conclusão
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Strategic Insights */}
          {insights?.insightCards && (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="text-lg font-headline text-blue-800">Clima Institucional</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700">
                    {insights.insightCards.climate}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-lg font-headline text-green-800">Engajamento Coletivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700">
                    {insights.insightCards.engagement}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="text-lg font-headline text-purple-800">Estratégias de Ensino</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-700">
                    {insights.insightCards.explanation}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Performance Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <TrendingUp className="h-5 w-5" />
                Tendências de Performance
              </CardTitle>
              <CardDescription>
                Padrões identificados no desempenho organizacional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Pontos Fortes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {completionRate > 70 ? "Alto engajamento geral" : completionRate > 50 ? "Engajamento moderado" : "Oportunidade de melhorar engajamento"}</li>
                    <li>• {totalResponses > totalStudents * 0.8 ? "Boa cobertura de dados" : "Dados representativos disponíveis"}</li>
                    <li>• {totalClasses > 5 ? "Escala institucional significativa" : "Base sólida para crescimento"}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Áreas de Atenção</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {diversityMetrics?.completionRateVariance > 20 ? "Variação significativa entre turmas" : "Consistência adequada entre turmas"}</li>
                    <li>• {completionRate < 60 ? "Oportunidade de aumentar participação" : "Participação satisfatória"}</li>
                    <li>• Monitoramento contínuo recomendado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          {/* Team Composition for Organization */}
          {insights?.teamsData && insights.teamsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <Users className="h-5 w-5" />
                  Composição de Equipes Institucional
                </CardTitle>
                <CardDescription>
                  Distribuição estratégica dos perfis de aprendizagem na instituição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {insights.teamsData.map((team: any, index: number) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg">
                      <h4 className="font-medium text-sm">{team.category}</h4>
                      <p className="text-xs text-muted-foreground">{team.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {team.students.length} alunos
                        </Badge>
                        <span className="text-xs font-medium">
                          {((team.students.length / totalResponses) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Award className="h-5 w-5" />
                Recomendações Estratégicas
              </CardTitle>
              <CardDescription>
                Sugestões baseadas nos dados organizacionais para otimização institucional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-700">🎯 Ações Imediatas</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Identificar turmas com baixa participação para intervenção direcionada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Implementar estratégias baseadas nos perfis predominantes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Desenvolver plano de formação para professores</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-700">📈 Estratégias de Longo Prazo</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Padronizar metodologias baseadas nos dados organizacionais</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Criar grupos de trabalho diversificados por perfil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Desenvolver currículo adaptativo aos estilos de aprendizagem</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* No Data State */}
      {totalResponses === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nenhum dado disponível ainda</p>
              <p className="text-sm">
                Os insights organizacionais aparecerão aqui quando os alunos começarem a responder aos questionários.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
