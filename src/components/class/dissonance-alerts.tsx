"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, ChevronLeft, ChevronRight, Users, Brain, MessageSquare, Zap, Heart, Target, Clock, TrendingUp } from "lucide-react";
import type { UnifiedProfile, Student } from "@/lib/types";

interface DissonanceAlert {
  studentName: string;
  note: string;
  studentId?: string;
  profile?: UnifiedProfile;
}

interface EnhancedDissonanceAlert extends DissonanceAlert {
  factors: {
    disc: boolean;
    jungian: boolean;
    vark: boolean;
    communication: boolean;
    energy: boolean;
    age: boolean;
  };
  severity: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  color: string;
  primaryFactor: string;
  recommendations: string[];
}

interface DissonanceAlertsProps {
  dissonanceData: DissonanceAlert[];
  students: Student[];
  profiles: UnifiedProfile[];
}

export function DissonanceAlerts({ dissonanceData, students, profiles }: DissonanceAlertsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Enhanced dissonance data with comprehensive analysis
  const enhancedDissonanceData = useMemo(() => {
    return dissonanceData.map(alert => {
      const student = students.find(s => s.name === alert.studentName);
      const profile = student ? profiles.find(p => p.studentId === student.id) : undefined;

      // Analyze multiple factors for richer insights
      const factors = {
        disc: profile ? (profile.discProfile.dominant === 'Influência' || profile.discProfile.dominant === 'Dominância') : false,
        jungian: profile ? profile.jungianProfile.type.startsWith('I') : false,
        vark: profile ? profile.varkProfile.dominant === 'Multimodal' : false,
        communication: alert.note.includes('comunicação') || alert.note.includes('social') || alert.note.includes('feedback'),
        energy: alert.note.includes('energia') || alert.note.includes('consumo') || alert.note.includes('exaustão'),
        age: student ? (student.age < 15 || student.age > 18) : false
      };

      // Determine severity based on multiple factors
      let severity: 'high' | 'medium' | 'low' = 'low';
      const activeFactors = Object.values(factors).filter(Boolean).length;

      if (activeFactors >= 3) severity = 'high';
      else if (activeFactors >= 2) severity = 'medium';

      // Dynamic icon and color based on primary factor (softer, more readable colors)
      let icon: React.ReactNode;
      let color: string;
      let primaryFactor: string;

      if (factors.energy) {
        icon = <Zap className="h-4 w-4" />;
        color = 'bg-slate-100 text-slate-700';
        primaryFactor = 'Energia';
      } else if (factors.communication) {
        icon = <MessageSquare className="h-4 w-4" />;
        color = 'bg-blue-100 text-blue-700';
        primaryFactor = 'Comunicação';
      } else if (factors.disc) {
        icon = <Target className="h-4 w-4" />;
        color = 'bg-indigo-100 text-indigo-700';
        primaryFactor = 'Comportamento';
      } else if (factors.jungian) {
        icon = <Brain className="h-4 w-4" />;
        color = 'bg-emerald-100 text-emerald-700';
        primaryFactor = 'Personalidade';
      } else if (factors.age) {
        icon = <Clock className="h-4 w-4" />;
        color = 'bg-violet-100 text-violet-700';
        primaryFactor = 'Desenvolvimento';
      } else {
        icon = <AlertTriangle className="h-4 w-4" />;
        color = 'bg-gray-100 text-gray-700';
        primaryFactor = 'Geral';
      }

      // Generate ultra-personalized recommendations based on profile combinations
      const recommendations: string[] = [];
      const discType = profile?.discProfile.dominant;
      const jungianType = profile?.jungianProfile.type;
      const varkType = profile?.varkProfile.dominant;
      const studentAge = student?.age;

      // Create unique recommendation combinations based on profile intersections
      if (factors.energy) {
        // Energy + DISC combinations
        if (discType === 'Influência') {
          if (jungianType?.startsWith('E')) {
            recommendations.push("Permitir pausas sociais frequentes para recarregar energia interpessoal");
            recommendations.push("Alternar entre atividades em grupo e individuais a cada 20-30 minutos");
          } else {
            recommendations.push("Oferecer opções de participação silenciosa em discussões");
            recommendations.push("Permitir saídas temporárias para recarregar energia social");
          }
        } else if (discType === 'Dominância') {
          if (jungianType?.includes('N')) {
            recommendations.push("Quebrar projetos criativos em marcos conceituais intermediários");
            recommendations.push("Permitir exploração independente durante fases extenuantes");
          } else {
            recommendations.push("Dividir tarefas práticas em etapas com prazos específicos");
            recommendations.push("Oferecer autonomia para pausar e retomar trabalho conforme energia");
          }
        } else if (discType === 'Estabilidade') {
          if (varkType === 'Visual') {
            recommendations.push("Manter ambiente visualmente consistente durante pausas");
            recommendations.push("Usar sinais visuais para indicar momentos de descanso");
          } else {
            recommendations.push("Estabelecer rotina previsível de pausas curtas e regulares");
            recommendations.push("Permitir processamento gradual de informações complexas");
          }
        } else if (discType === 'Consciência') {
          if (jungianType?.includes('T')) {
            recommendations.push("Quebrar análises detalhadas em sessões menores com intervalos");
            recommendations.push("Permitir revisão independente de trabalho antes de submissão");
          } else {
            recommendations.push("Oferecer tempo extra para processamento emocional de feedback");
            recommendations.push("Manter ambiente calmo para trabalho detalhado");
          }
        } else {
          recommendations.push("Implementar pausas regulares adaptadas ao ritmo individual");
          recommendations.push("Observar sinais de fadiga e adaptar carga de trabalho");
        }
      }

      if (factors.communication) {
        // Communication + Jungian combinations
        if (jungianType?.includes('F')) {
          if (discType === 'Influência') {
            recommendations.push("Usar histórias pessoais para contextualizar feedback emocional");
            recommendations.push("Encorajar expressão verbal de sentimentos durante correções");
          } else if (discType === 'Estabilidade') {
            recommendations.push("Explicar mudanças emocionais de forma gradual e empática");
            recommendations.push("Usar analogias relacionais para esclarecer conceitos");
          } else {
            recommendations.push("Combinar feedback emocional com validação de esforços");
            recommendations.push("Focar no impacto pessoal das observações");
          }
        } else if (jungianType?.includes('T')) {
          if (discType === 'Consciência') {
            recommendations.push("Fornecer dados específicos sobre padrões de erro identificados");
            recommendations.push("Usar métricas objetivas para medir progresso");
          } else if (discType === 'Dominância') {
            recommendations.push("Estruturar feedback como desafios específicos para superar");
            recommendations.push("Conectar correções a metas de desempenho claras");
          } else {
            recommendations.push("Usar linguagem factual e baseada em observações concretas");
            recommendations.push("Fornecer exemplos específicos de melhoria");
          }
        } else {
          recommendations.push("Adaptar estilo de comunicação baseado em respostas observadas");
          recommendations.push("Equilibrar feedback emocional com dados objetivos");
        }
      }

      if (factors.disc) {
        // DISC-specific recommendations with Jungian/VARK integration
        if (discType === 'Influência') {
          if (jungianType?.includes('N')) {
            recommendations.push("Criar oportunidades para apresentações criativas e visionárias");
            recommendations.push("Encorajar networking e conexões interpessoais inovadoras");
          } else {
            recommendations.push("Facilitar interações sociais práticas e colaborativas");
            recommendations.push("Criar grupos de apoio mútuo para projetos");
          }
        } else if (discType === 'Dominância') {
          if (varkType === 'Cinestésico') {
            recommendations.push("Permitir liderança hands-on em projetos práticos");
            recommendations.push("Criar desafios físicos que envolvam tomada de decisão");
          } else {
            recommendations.push("Estabelecer metas desafiadoras com autonomia de execução");
            recommendations.push("Permitir liderança natural em dinâmicas de grupo");
          }
        } else if (discType === 'Estabilidade') {
          if (jungianType?.startsWith('I')) {
            recommendations.push("Fornecer estrutura previsível com espaço para reflexão individual");
            recommendations.push("Explicar mudanças antecipadamente com tempo para adaptação");
          } else {
            recommendations.push("Manter rotinas sociais consistentes e reconfortantes");
            recommendations.push("Criar ambiente estável para interações em grupo");
          }
        } else if (discType === 'Consciência') {
          if (jungianType?.includes('S')) {
            recommendations.push("Permitir análise detalhada de processos práticos");
            recommendations.push("Encorajar atenção meticulosa a procedimentos estabelecidos");
          } else {
            recommendations.push("Oferecer tempo para reflexão profunda sobre padrões complexos");
            recommendations.push("Facilitar análise sistemática de problemas conceituais");
          }
        }
      }

      if (factors.jungian) {
        // Jungian-specific with DISC/VARK integration
        if (jungianType?.startsWith('I')) {
          if (discType === 'Consciência') {
            recommendations.push("Permitir processamento independente e detalhado de informações");
            recommendations.push("Oferecer opções não-verbais para contribuição em grupo");
          } else {
            recommendations.push("Respeitar necessidade de reflexão antes de participação verbal");
            recommendations.push("Criar espaço para contribuições escritas ou individuais");
          }
        } else if (jungianType?.startsWith('E')) {
          if (discType === 'Influência') {
            recommendations.push("Encorajar discussões energizadas e interação social frequente");
            recommendations.push("Criar ambiente verbalmente ativo e colaborativo");
          } else {
            recommendations.push("Facilitar debates imediatos e troca verbal de ideias");
            recommendations.push("Manter dinâmica energética durante atividades em grupo");
          }
        }

        if (jungianType?.includes('N')) {
          if (varkType === 'Visual') {
            recommendations.push("Usar mapas mentais e representações visuais abstratas");
            recommendations.push("Conectar conceitos teóricos com aplicações visuais");
          } else {
            recommendations.push("Explorar conexões conceituais profundas e filosóficas");
            recommendations.push("Encorajar pensamento visionário e criativo");
          }
        } else if (jungianType?.includes('S')) {
          if (varkType === 'Cinestésico') {
            recommendations.push("Incorporar experiências práticas e hands-on");
            recommendations.push("Conectar teoria com aplicações físicas concretas");
          } else {
            recommendations.push("Fornecer dados factuais e exemplos práticos específicos");
            recommendations.push("Quebrar conceitos em passos sequenciais observáveis");
          }
        }
      }

      if (factors.age) {
        // Age-specific with profile integration
        if (studentAge && studentAge < 15) {
          if (jungianType?.includes('N')) {
            recommendations.push("Usar linguagem acessível para explicar conceitos abstratos complexos");
            recommendations.push("Conectar ideias visionárias com experiências concretas da idade");
          } else {
            recommendations.push("Adaptar exemplos para contexto de vida dos jovens adolescentes");
            recommendations.push("Focar em aplicações práticas relevantes para a idade");
          }
        } else if (studentAge && studentAge > 18) {
          if (discType === 'Consciência') {
            recommendations.push("Envolver em análises críticas aprofundadas e debates acadêmicos");
            recommendations.push("Considerar experiências de vida na contextualização avançada");
          } else {
            recommendations.push("Facilitar discussões maduras sobre implicações sociais e éticas");
            recommendations.push("Conectar aprendizado com aplicações profissionais reais");
          }
        }
      }

      // Ensure we have at least 2 personalized recommendations
      if (recommendations.length < 2) {
        if (profile) {
          recommendations.push(`Observar respostas específicas do perfil ${discType}-${jungianType} durante atividades`);
          recommendations.push("Manter registro individual de padrões de conforto e desconforto");
        } else {
          recommendations.push("Observar sinais de desconforto durante atividades");
          recommendations.push("Manter comunicação aberta sobre necessidades individuais");
        }
      }

      // Limit to top 3 most relevant recommendations
      recommendations.splice(3);

      return {
        ...alert,
        studentId: student?.id,
        profile,
        factors,
        severity,
        icon,
        color,
        primaryFactor,
        recommendations
      };
    });
  }, [dissonanceData, students, profiles]);

  // Search logic
  const filteredData = useMemo(() => {
    if (!searchTerm) return enhancedDissonanceData;

    return enhancedDissonanceData.filter(alert =>
      alert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.primaryFactor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enhancedDissonanceData, searchTerm]);

  // Sort by severity (high first)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Alta Prioridade</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Média Prioridade</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Baixa Prioridade</Badge>;
    }
  };

  const getProfileSummary = (profile: UnifiedProfile) => {
    return `${profile.discProfile.dominant} • ${profile.jungianProfile.type} • ${profile.varkProfile.dominant}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-slate-700">
          <TrendingUp />
          Quem precisa de mais atenção?
        </CardTitle>
        <CardDescription>
          Análise inteligente considerando múltiplos fatores do perfil do aluno
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição ou tipo de atenção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredData.length} de {enhancedDissonanceData.length} alertas
            {searchTerm && ` para "${searchTerm}"`}
          </span>
          {totalPages > 1 && (
            <span>
              Página {currentPage} de {totalPages}
            </span>
          )}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {paginatedData.length > 0 ? (
            paginatedData.map((alert, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2 rounded-full ${alert.color.replace('text-', 'bg-').replace('-700', '-200')}`}>
                    {alert.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">{alert.studentName}</h4>
                        <Badge className={alert.color}>
                          {alert.primaryFactor}
                        </Badge>
                        {getSeverityBadge(alert.severity)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">{alert.note}</p>

                    {/* Profile Summary */}
                    {alert.profile && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Perfil:</span>
                        <Badge variant="outline" className="text-xs">
                          {getProfileSummary(alert.profile)}
                        </Badge>
                      </div>
                    )}

                    {/* Recommendations */}
                    {alert.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-medium text-slate-700 flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Recomendações:
                        </h5>
                        <ul className="space-y-1">
                          {alert.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="text-slate-400 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum alerta encontrado</p>
              <p className="text-sm">
                {searchTerm
                  ? 'Tente ajustar os termos de busca'
                  : 'Nenhum ponto de atenção identificado na turma.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
