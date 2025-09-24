"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import {
  CheckCircle,
  X,
  BookOpen,
  Users,
  Settings,
  Mail,
  Key,
  ArrowRight,
  Sparkles,
  GraduationCap,
  UserCheck,
  Lightbulb,
  Play,
  Check,
  Star,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Award
} from "lucide-react";

interface WelcomeOnboardingProps {
  onComplete?: () => void;
}

export function WelcomeOnboarding({ onComplete }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tempPassword, setTempPassword] = useState<string>("");
  const { user: userProfile } = useUserProfile();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('mudeai-onboarding-seen');
    const onboardingVersion = localStorage.getItem('mudeai-onboarding-version');

    // Check if this is a new user (just activated their account)
    const isNewUser = userProfile && (
      !hasSeenOnboarding ||
      onboardingVersion !== '2.0' ||
      sessionStorage.getItem('mudeai-new-user') === 'true'
    );

    if (isNewUser && userProfile) {
      setShowOnboarding(true);

      // Generate temp password for display (this should match the one used during signup)
      const storedTempPassword = sessionStorage.getItem('mudeai-temp-password');
      if (storedTempPassword) {
        setTempPassword(storedTempPassword);
      }
    }
  }, [userProfile]);

  const handleComplete = () => {
    // Mark onboarding as seen
    localStorage.setItem('mudeai-onboarding-seen', 'true');
    localStorage.setItem('mudeai-onboarding-version', '2.0');
    sessionStorage.removeItem('mudeai-new-user');
    sessionStorage.removeItem('mudeai-temp-password');

    setShowOnboarding(false);
    onComplete?.();

    toast({
      title: "Bem-vindo ao MUDEAI! 🎉",
      description: "Sua jornada de descoberta começa agora.",
    });
  };

  const handleSkip = () => {
    handleComplete();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  if (!showOnboarding || !userProfile) {
    return null;
  }

  const userRole = (userProfile as any)?.role;
  const isTeacher = userRole === 'teacher';
  const isAdmin = userRole === 'admin';

  // Define steps based on user role
  const getStepsForRole = () => {
    if (isTeacher) {
      return [
        // Step 0: Welcome for Teacher
        {
          title: `Bem-vindo ao MUDEAI, ${(userProfile as any)?.name || userProfile?.displayName || 'Professor'}! 👨‍🏫`,
          description: "Você foi convidado para fazer parte da nossa plataforma de avaliação psicopedagógica.",
          content: (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Parabéns! 🎉</h3>
                  <p className="text-muted-foreground text-base">
                    Você foi selecionado para fazer parte da nossa comunidade de educadores inovadores.
                    Vamos configurar sua conta e mostrar como revolucionar sua prática pedagógica.
                  </p>
                </div>
              </div>

              {tempPassword && (
                <Alert className="border-amber-200 bg-amber-50 shadow-sm">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-2">
                      <strong className="text-amber-900">Sua senha temporária:</strong>
                      <div className="p-4 bg-white rounded-lg border-2 border-amber-200 font-mono text-center text-lg font-semibold text-amber-800 shadow-inner">
                        {tempPassword}
                      </div>
                      <p className="text-sm text-amber-700 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Guarde esta senha! Você pode alterá-la nas configurações da conta.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold text-blue-900">O que você vai descobrir:</h4>
                </div>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Avaliação psicopedagógica automatizada
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Relatórios personalizados em PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Insights baseados em dados científicos
                  </li>
                </ul>
              </div>
            </div>
          )
        },

        // Step 1: Teacher-specific features
        {
          title: "Suas Super Ferramentas de Professor",
          description: "Descubra como o MUDEAI transforma a avaliação psicopedagógica em algo simples e poderoso.",
          content: (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Turmas Inteligentes</h3>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Configure turmas personalizadas, defina objetivos específicos e convide alunos
                    com links únicos. Tudo organizado e rastreável.
                  </p>
                </div>

                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-900">Avaliação Completa</h3>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed">
                    Questionários científicos avaliam múltiplas dimensões do perfil psicopedagógico
                    dos alunos, revelando insights únicos sobre cada estudante.
                  </p>
                </div>

                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900">Relatórios Avançados</h3>
                  </div>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    Receba relatórios detalhados em PDF com gráficos, análises e recomendações
                    personalizadas para cada aluno. Ciência aplicada à educação.
                  </p>
                </div>

                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-900">Automação Total</h3>
                  </div>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    Os alunos recebem automaticamente seus resultados por email assim que completam
                    as avaliações. Você foca no que importa: ensinar!
                  </p>
                </div>
              </div>

              <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
                <Award className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong className="text-blue-900">Dica Premium:</strong> Cada relatório em PDF é
                  profissional, personalizado e baseado em décadas de pesquisa psicopedagógica.
                  Seus alunos receberão insights que podem transformar suas vidas acadêmicas!
                </AlertDescription>
              </Alert>
            </div>
          )
        },

        // Step 2: Getting started for teachers
        {
          title: "Sua Jornada Começa Agora!",
          description: "Em poucos minutos você terá sua primeira turma configurada e pronta para revolucionar sua prática docente.",
          content: (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900">Seu Plano de Ação (5 minutos)</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-green-100">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      1
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Acesse suas Turmas</h4>
                      <p className="text-sm text-gray-600">Clique no menu lateral esquerdo e selecione "Turmas"</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-green-100">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      2
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Crie sua Primeira Turma</h4>
                      <p className="text-sm text-gray-600">Defina nome, configurações e personalize para seus alunos</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-green-100">
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      3
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Convide seus Alunos</h4>
                      <p className="text-sm text-gray-600">Copie o link de convite e compartilhe (WhatsApp, email, etc.)</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-green-100">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      4
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Acompanhe Resultados</h4>
                      <p className="text-sm text-gray-600">Veja os perfis psicopedagógicos e insights dos alunos</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-purple-900">🎯 Sua Meta Inicial</h4>
                </div>
                <p className="text-sm text-purple-800 leading-relaxed">
                  Configure apenas uma turma hoje e convide 2-3 alunos para testar.
                  Amanhã você verá como a avaliação psicopedagógica pode ser transformadora!
                  Cada relatório gerado é uma oportunidade de impactar vidas.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200">
                  <Play className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Pronto para começar?</span>
                </div>
              </div>
            </div>
          )
        }
      ];
    } else if (isAdmin) {
      return [
        // Step 0: Welcome for Admin
        {
          title: `Bem-vindo ao MUDEAI, ${(userProfile as any)?.name || userProfile?.displayName || 'Diretor'}! 👔`,
          description: "Sua conta administrativa foi criada com sucesso. Você terá controle total sobre a transformação educacional da sua instituição.",
          content: (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <UserCheck className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Líder Educacional! 🎓</h3>
                  <p className="text-muted-foreground text-base">
                    Você foi escolhido para liderar a transformação da sua instituição através da
                    avaliação psicopedagógica baseada em dados científicos.
                  </p>
                </div>
              </div>

              {tempPassword && (
                <Alert className="border-amber-200 bg-amber-50 shadow-sm">
                  <Shield className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <div className="space-y-2">
                      <strong className="text-amber-900">Sua senha administrativa:</strong>
                      <div className="p-4 bg-white rounded-lg border-2 border-amber-200 font-mono text-center text-lg font-semibold text-amber-800 shadow-inner">
                        {tempPassword}
                      </div>
                      <p className="text-sm text-amber-700 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Guarde com segurança! Você pode alterá-la nas configurações.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Seu Impacto como Líder:</h4>
                </div>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Capacitar todos os professores da instituição
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Acompanhar o desenvolvimento de cada aluno
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-600" />
                    Tomar decisões baseadas em dados científicos
                  </li>
                </ul>
              </div>
            </div>
          )
        },

        // Step 1: Admin-specific features
        {
          title: "Seu Centro de Controle Administrativo",
          description: "Como diretor, você tem o poder de transformar toda a instituição através de uma gestão baseada em dados.",
          content: (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900">Gestão de Professores</h3>
                  </div>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    Convide, gerencie acessos e acompanhe o desempenho de todos os educadores
                    da instituição. Tenha controle total sobre sua equipe pedagógica.
                  </p>
                </div>

                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Analytics Institucional</h3>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Visualize métricas completas da instituição, acompanhe o progresso dos alunos
                    e tome decisões estratégicas baseadas em dados científicos.
                  </p>
                </div>

                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-900">Configurações Avançadas</h3>
                  </div>
                  <p className="text-sm text-green-800 leading-relaxed">
                    Personalize questionários, configure notificações automáticas e ajuste
                    todas as permissões da plataforma para sua realidade institucional.
                  </p>
                </div>

                <div className="group p-5 border-2 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-900">Comunicação Inteligente</h3>
                  </div>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    Configure templates de email personalizados, monitore todas as comunicações
                    e mantenha pais e alunos sempre informados sobre o progresso.
                  </p>
                </div>
              </div>

              <Alert className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 shadow-sm">
                <Award className="h-5 w-5 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong className="text-purple-900">Poder Transformador:</strong> Você pode convidar
                  professores através de links compartilháveis que funcionam em qualquer canal
                  (WhatsApp, email, reuniões presenciais). Cada professor que você ativa multiplica
                  o impacto da avaliação psicopedagógica em sua instituição!
                </AlertDescription>
              </Alert>
            </div>
          )
        },

        // Step 2: Getting started for admins
        {
          title: "Sua Missão Começa Agora!",
          description: "Em poucos minutos você terá sua instituição preparada para uma revolução educacional baseada em dados científicos.",
          content: (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">Seu Plano Executivo (10 minutos)</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-purple-100">
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      1
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Acesse Gestão de Professores</h4>
                      <p className="text-sm text-gray-600">Clique em "Professores" no menu lateral para começar sua equipe</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-purple-100">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      2
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Convide seus Professores</h4>
                      <p className="text-sm text-gray-600">Use o botão "Convidar Professor" para enviar convites personalizados</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-purple-100">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      3
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Distribua os Links</h4>
                      <p className="text-sm text-gray-600">Copie os links gerados e compartilhe via WhatsApp, email ou reuniões</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>

                  <div className="flex items-start gap-4 p-3 bg-white rounded-lg border border-purple-100">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-sm font-semibold min-w-[28px] flex items-center justify-center">
                      4
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Monitore o Progresso</h4>
                      <p className="text-sm text-gray-600">Acompanhe ativações, turmas criadas e resultados no dashboard</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-green-900">🎯 Sua Visão Executiva</h4>
                </div>
                <p className="text-sm text-green-800 leading-relaxed">
                  Comece convidando 3-5 professores hoje. Cada professor ativado representa
                  dezenas de alunos que terão acesso a uma avaliação psicopedagógica profissional.
                  Sua liderança pode transformar a educação de toda uma instituição!
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200">
                  <Play className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Pronto para liderar a transformação?</span>
                </div>
              </div>
            </div>
          )
        }
      ];
    } else {
      // Default/generic onboarding for other roles
      return [
        {
          title: `Bem-vindo ao MUDEAI, ${(userProfile as any)?.name || userProfile?.displayName || 'Usuário'}! 🎉`,
          description: "Sua conta foi criada com sucesso. Vamos começar a usar a plataforma!",
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <p className="text-muted-foreground">
                  Vamos configurar sua conta e mostrar as funcionalidades disponíveis.
                </p>
              </div>

              {tempPassword && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sua senha temporária:</strong>
                    <div className="mt-2 p-3 bg-white rounded border font-mono text-center">
                      {tempPassword}
                    </div>
                    <p className="text-sm mt-2 text-blue-700">
                      ⚠️ Guarde esta senha! Você pode alterá-la nas configurações da conta.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )
        }
      ];
    }
  };

  const steps = getStepsForRole();

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white">
        <CardHeader className="relative bg-white border-b">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <CardTitle className="text-xl text-gray-900 font-semibold">{currentStepData.title}</CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              {currentStepData.description}
            </CardDescription>
          </div>

          {/* Progress indicator */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progresso</span>
              <span>{currentStep + 1} de {steps.length}</span>
            </div>
            <Progress
              value={((currentStep + 1) / steps.length) * 100}
              className="h-2"
            />
            <div className="flex justify-center">
              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 bg-white text-gray-900">
          {currentStepData.content}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Pular Tutorial
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Começar a Usar
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
