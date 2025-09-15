"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Student, UnifiedProfile, CustomField, RawUnifiedProfile } from "@/lib/types";
import {
  User,
  Calendar,
  Mail,
  BookOpen,
  Target,
  Heart,
  Brain,
  BarChart3,
  FileText,
  X
} from "lucide-react";

// Mapeamento das perguntas do quiz para exibição formatada
const quizQuestionsMap: Record<string, { question: string; part: string; type: string; options?: Array<{ value: string; label: string }> }> = {
  'vark_1': {
    question: 'Quando você precisa aprender algo novo e complexo, o que mais te ajuda?',
    part: 'Parte 1: Como você aprende (VARK)',
    type: 'radio',
    options: [
      { value: 'V', label: 'Ver gráficos, infográficos e vídeos que demonstram o conceito.' },
      { value: 'A', label: 'Ouvir uma boa explicação, um podcast, ou discutir o tópico.' },
      { value: 'R', label: 'Ler um artigo, livro ou manual bem escrito sobre o assunto.' },
      { value: 'K', label: 'Colocar a mão na massa, experimentar ou fazer um exercício prático.' },
    ],
  },
  'vark_2': {
    question: 'Imagine que você está tentando chegar a um lugar novo. qual estratégia você escolheria?',
    part: 'Parte 1: Como você aprende (VARK)',
    type: 'radio',
    options: [
      { value: 'V', label: 'Olhar um mapa visual no GPS do seu celular.' },
      { value: 'A', label: 'Pedir ao GPS para dar instruções por voz.' },
      { value: 'R', label: 'Ler uma lista de nomes de ruas e direções a seguir.' },
      { value: 'K', label: 'Apenas começar a dirigir e se guiar por pontos de referência no caminho.' },
    ],
  },
  'vark_3': {
    question: 'Para se lembrar de algo importante para uma prova, qual método funciona melhor para você?',
    part: 'Parte 1: Como você aprende (VARK)',
    type: 'radio',
    options: [
      { value: 'V', label: 'Criar mapas mentais coloridos ou usar marca-textos para grifar o material.' },
      { value: 'A', label: 'Explicar a matéria em voz alta para si mesmo ou para um colega.' },
      { value: 'R', label: 'Fazer resumos escritos e reler suas anotações várias vezes.' },
      { value: 'K', label: 'Associar o conteúdo a um movimento, a uma história ou a um exemplo real.' },
    ],
  },
  'vark_4': {
    question: 'Em uma apresentação ou palestra, o que mais prende a sua atenção?',
    part: 'Parte 1: Como você aprende (VARK)',
    type: 'radio',
    options: [
      { value: 'V', label: 'O design dos slides, as imagens e os gráficos apresentados.' },
      { value: 'A', label: 'A clareza da fala, o tom de voz e as histórias contadas pelo palestrante.' },
      { value: 'R', label: 'A quantidade de dados e informações textuais detalhadas nos slides.' },
      { value: 'K', label: 'As atividades interativas, demonstrações ao vivo ou estudos de caso práticos.' },
    ],
  },
  'jung_1': {
    question: 'Depois de um dia cheio de atividades em grupo, você se sente:',
    part: 'Parte 3: Como sua mente funciona (Jungiano)',
    type: 'radio',
    options: [
      { value: 'I', label: 'Esgotado(a), precisando de um tempo sozinho(a) para recarregar.' },
      { value: 'E', label: 'Energizado(a) e animado(a), querendo continuar a interagir.' },
    ],
  },
  'jung_2': {
    question: 'Ao lidar com uma nova tarefa, você tende a:',
    part: 'Parte 3: Como sua mente funciona (Jungiano)',
    type: 'radio',
    options: [
      { value: 'S', label: 'Focar nos detalhes práticos e seguir um passo a passo claro.' },
      { value: 'N', label: 'Pensar nas possibilidades, nas conexões e na visão geral do projeto.' },
    ],
  },
  'jung_3': {
    question: 'Na hora de tomar uma decisão, o que pesa mais para você?',
    part: 'Parte 3: Como sua mente funciona (Jungiano)',
    type: 'radio',
    options: [
      { value: 'T', label: 'A lógica, a análise imparcial dos fatos e a objetividade.' },
      { value: 'F', label: 'O impacto da decisão nas pessoas envolvidas e em seus valores pessoais.' },
    ],
  },
  'jung_4': {
    question: 'Seu estilo de trabalho preferido é:',
    part: 'Parte 3: Como sua mente funciona (Jungiano)',
    type: 'radio',
    options: [
      { value: 'J', label: 'Ter um plano bem definido, com prazos e metas claras, e segui-lo.' },
      { value: 'P', label: 'Manter as opções em aberto e se adaptar conforme as coisas acontecem.' },
    ],
  },
  // DISC Questions
  'disc_1': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Decidido', label: 'Decidido' },
      { value: 'Influente', label: 'Influente' },
      { value: 'Paciente', label: 'Paciente' },
      { value: 'Detalhado', label: 'Detalhado' },
    ],
  },
  'disc_2': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Competitivo', label: 'Competitivo' },
      { value: 'Otimista', label: 'Otimista' },
      { value: 'Estável', label: 'Estável' },
      { value: 'Cauteloso', label: 'Cauteloso' },
    ],
  },
  'disc_3': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Direto', label: 'Direto' },
      { value: 'Sociável', label: 'Sociável' },
      { value: 'Previsível', label: 'Previsível' },
      { value: 'Perfeccionista', label: 'Perfeccionista' },
    ],
  },
  'disc_4': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Ousado', label: 'Ousado' },
      { value: 'Entusiasmado', label: 'Entusiasmado' },
      { value: 'Calmo', label: 'Calmo' },
      { value: 'Sistemático', label: 'Sistemático' },
    ],
  },
  'disc_5': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Focado em resultados', label: 'Focado em resultados' },
      { value: 'Inspirador', label: 'Inspirador' },
      { value: 'Apoiador', label: 'Apoiador' },
      { value: 'Lógico', label: 'Lógico' },
    ],
  },
  'disc_6': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Exigente', label: 'Exigente' },
      { value: 'Comunicativo', label: 'Comunicativo' },
      { value: 'Consistente', label: 'Consistente' },
      { value: 'Preciso', label: 'Preciso' },
    ],
  },
  'disc_7': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Pioneiro', label: 'Pioneiro' },
      { value: 'Convincente', label: 'Convincente' },
      { value: 'Leal', label: 'Leal' },
      { value: 'Cuidadoso', label: 'Cuidadoso' },
    ],
  },
  'disc_8': {
    question: 'Em cada grupo de quatro palavras, escolha a que é MAIS parecida com você e a que é MENOS parecida com você.',
    part: 'Parte 2: Como você age e interage (DISC)',
    type: 'disc',
    options: [
      { value: 'Independente', label: 'Independente' },
      { value: 'Divertido', label: 'Divertido' },
      { value: 'Harmonioso', label: 'Harmonioso' },
      { value: 'Organizado', label: 'Organizado' },
    ],
  },
  // Schwartz Questions
  'schwartz_1': {
    question: 'Ter a liberdade de escolher o que faz e pensa por si mesmo é muito importante para esta pessoa.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_2': {
    question: 'Ela busca uma vida cheia de emoção, novidades e desafios.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_3': {
    question: 'Para ela, sentir prazer e aproveitar os bons momentos da vida é uma prioridade.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_4': {
    question: 'Ser bem-sucedido(a) e mostrar aos outros que é capaz é algo que a motiva muito.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_5': {
    question: 'Ela gosta de liderar, ser responsável e ter influência sobre as coisas.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_6': {
    question: 'Viver em um ambiente seguro, estável e organizado é fundamental para seu bem-estar.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_7': {
    question: 'Ela se esforça para seguir as regras e nunca decepcionar as pessoas ao seu redor.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_8': {
    question: 'Para ela, é importante respeitar os costumes e as tradições de sua família e cultura.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_9': {
    question: 'Ajudar as pessoas que ama e ser um amigo(a) leal é uma de suas maiores qualidades.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
  'schwartz_10': {
    question: 'Ela se preocupa muito com a igualdade, a justiça social e a proteção do meio ambiente.',
    part: 'Parte 4: O que realmente te move (Schwartz)',
    type: 'scale',
  },
};

interface StudentDetailsModalProps {
  student: Student | null;
  profile: UnifiedProfile | null;
  rawProfile?: RawUnifiedProfile | null;
  customFields?: CustomField[];
  customFieldValues?: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailsModal({
  student,
  profile,
  rawProfile,
  customFields = [],
  customFieldValues = {},
  isOpen,
  onClose
}: StudentDetailsModalProps) {
  if (!student) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Nome:</span>
              <span>{student.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Idade:</span>
              <span>{student.age} anos</span>
            </div>
            {student.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">E-mail:</span>
                <span>{student.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">Status do Quiz:</span>
              <Badge variant={student.quizStatus === 'completed' ? 'default' : 'secondary'}>
                {student.quizStatus === 'completed' ? 'Concluído' : 'Pendente'}
              </Badge>
            </div>

          </CardContent>
        </Card>

        {customFields.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Campos Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customFields.map((field) => (
                <div key={field.id} className="flex items-start gap-2">
                  <span className="font-medium text-sm">{field.label}:</span>
                  <span className="text-sm text-muted-foreground">
                    {customFieldValues[field.id] || 'Não informado'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderProfiles = () => (
    <div className="space-y-4">
      {profile ? (
        <>
          {/* VARK Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Perfil de Aprendizagem (VARK)
              </CardTitle>
              <CardDescription>
                Estilo de aprendizagem predominante baseado no questionário VARK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {profile.varkProfile.dominant}
                  </Badge>
                  <span className="text-muted-foreground">Perfil Dominante</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(profile.varkProfile.scores).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-sm text-muted-foreground uppercase">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DISC Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Perfil Comportamental (DISC)
              </CardTitle>
              <CardDescription>
                Análise comportamental baseada no questionário DISC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {profile.discProfile.dominant}
                  </Badge>
                  <span className="text-muted-foreground">Perfil Dominante</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(profile.discProfile.scores).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">{value}</div>
                      <div className="text-sm text-muted-foreground uppercase">{key}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jungian Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Tipo Psicológico (Junguiano)
              </CardTitle>
              <CardDescription>
                Classificação baseada na teoria dos tipos psicológicos de Carl Jung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-lg px-3 py-1">
                  {profile.jungianProfile.type}
                </Badge>
                <span className="text-muted-foreground">Tipo Psicológico</span>
              </div>
            </CardContent>
          </Card>

          {/* Schwartz Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Valores Pessoais (Schwartz)
              </CardTitle>
              <CardDescription>
                Sistema de valores pessoais baseado na teoria de Shalom Schwartz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Valores Principais:</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.schwartzValues.top_values.map((value) => (
                      <Badge key={value} variant="outline">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Pontuações Detalhadas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(profile.schwartzValues.scores).map(([value, score]) => (
                      <div key={value} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="text-sm">{value}</span>
                        <span className="font-medium">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              O aluno ainda não completou o quiz psicométrico.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQuizAnswers = () => {
    const getAnswerText = (questionId: string, answer: any, allAnswers?: Record<string, any>) => {
      const question = quizQuestionsMap[questionId];

      if (!question) {
        // Fallback para perguntas não mapeadas
        return typeof answer === 'string' ? answer :
               Array.isArray(answer) ? answer.join(', ') :
               JSON.stringify(answer);
      }

      if (question.type === 'radio' && typeof answer === 'string') {
        const option = question.options?.find(opt => opt.value === answer);
        return option ? option.label : answer;
      }

      if (question.type === 'scale' && typeof answer === 'string') {
        const scaleLabels = {
          '1': 'Nada parecido comigo',
          '2': 'Um pouco como eu',
          '3': 'Parecido comigo',
          '4': 'Muito parecido comigo'
        };
        return scaleLabels[answer as keyof typeof scaleLabels] || answer;
      }

      if (question.type === 'disc' && allAnswers) {
        // Para perguntas DISC, as respostas estão em campos separados
        const most = allAnswers[`${questionId}_most`];
        const least = allAnswers[`${questionId}_least`];
        return `Mais parecido: ${most || 'N/A'} | Menos parecido: ${least || 'N/A'}`;
      }

      return typeof answer === 'string' ? answer :
             Array.isArray(answer) ? answer.join(', ') :
             JSON.stringify(answer);
    };

    return (
      <div className="space-y-4">
        {rawProfile?.rawAnswers ? (
          <Card>
            <CardHeader>
              <CardTitle>Respostas do Quiz</CardTitle>
              <CardDescription>
                Todas as respostas fornecidas pelo aluno no questionário psicométrico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {(() => {
                    // Filtrar apenas respostas que são perguntas do quiz (excluindo campos como name, age, email, gender)
                    const quizAnswers = Object.entries(rawProfile.rawAnswers)
                      .filter(([questionId]) =>
                        questionId.startsWith('vark_') ||
                        questionId.startsWith('disc_') ||
                        questionId.startsWith('jung_') ||
                        questionId.startsWith('schwartz_')
                      );

                    const mappedAnswers = quizAnswers.filter(([questionId]) => quizQuestionsMap[questionId]);

                    return (
                      <>
                        <div className="text-sm text-muted-foreground mb-4">
                          Mostrando {mappedAnswers.length} de {quizAnswers.length} respostas do quiz
                        </div>
                        {mappedAnswers.map(([questionId, answer]) => {
                          const question = quizQuestionsMap[questionId];
                          return (
                            <div key={questionId} className="border rounded-lg p-4 bg-card">
                              <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                                    {question.part}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm leading-relaxed">
                                    {question.question}
                                  </h4>
                                </div>
                                <div className="bg-muted/50 rounded-md p-3">
                                  <div className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {getAnswerText(questionId, answer, rawProfile.rawAnswers)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      </>
                    );
                  })()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                As respostas detalhadas do quiz não estão disponíveis no momento.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Esta funcionalidade será implementada em breve.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Detalhes do Aluno: {student.name}</DialogTitle>
          <DialogDescription>
            Informações completas sobre o aluno e seus perfis de aprendizagem
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="profiles">Perfis</TabsTrigger>
              <TabsTrigger value="answers">Respostas do Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="profiles" className="space-y-4 mt-4">
              {renderProfiles()}
            </TabsContent>

            <TabsContent value="answers" className="space-y-4 mt-4">
              {renderQuizAnswers()}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
