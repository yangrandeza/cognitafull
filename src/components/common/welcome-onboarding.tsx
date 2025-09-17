"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  Lightbulb
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
      onboardingVersion !== '1.0' ||
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
    localStorage.setItem('mudeai-onboarding-version', '1.0');
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
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <p className="text-muted-foreground">
                  Parabéns! Você foi selecionado para fazer parte da nossa comunidade de educadores.
                  Vamos configurar sua conta de professor.
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
        },

        // Step 1: Teacher-specific features
        {
          title: "Ferramentas do Professor",
          description: "Como professor, você terá acesso a poderosas ferramentas de avaliação psicopedagógica.",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium mb-1 text-blue-900">Criar e Gerenciar Turmas</h3>
                  <p className="text-sm text-blue-800">
                    Configure suas turmas, defina configurações personalizadas e convide alunos.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <Users className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium mb-1 text-green-900">Avaliação Psicopedagógica</h3>
                  <p className="text-sm text-green-800">
                    Acesse perfis completos dos alunos e personalize suas metodologias de ensino.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <Lightbulb className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium mb-1 text-purple-900">Relatórios e Insights</h3>
                  <p className="text-sm text-purple-800">
                    Gere relatórios detalhados e receba sugestões personalizadas para cada aluno.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <Mail className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="font-medium mb-1 text-orange-900">Comunicação Automática</h3>
                  <p className="text-sm text-orange-800">
                    Os alunos recebem automaticamente seus resultados por email após completar avaliações.
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Dica Especial:</strong> Cada aluno que completar o questionário receberá automaticamente
                  um relatório em PDF profissional com seu perfil psicométrico completo!
                </AlertDescription>
              </Alert>
            </div>
          )
        },

        // Step 2: Getting started for teachers
        {
          title: "Primeiros Passos como Professor",
          description: "Vamos começar sua jornada como educador na plataforma MUDEAI!",
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-blue-100 text-blue-700">
                    1
                  </Badge>
                  <span className="text-sm">
                    Acesse o menu lateral e clique em "Turmas"
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-green-100 text-green-700">
                    2
                  </Badge>
                  <span className="text-sm">
                    Crie sua primeira turma e configure as opções desejadas
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-purple-100 text-purple-700">
                    3
                  </Badge>
                  <span className="text-sm">
                    Convide seus alunos através do link de compartilhamento
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-100 text-orange-700">
                    4
                  </Badge>
                  <span className="text-sm">
                    Acompanhe os resultados dos alunos no painel de controle
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">🎯 Meta Inicial</h4>
                <p className="text-sm text-blue-800">
                  Configure pelo menos uma turma e convide seus primeiros alunos.
                  Você verá como é simples transformar a avaliação psicopedagógica com nossa plataforma!
                </p>
              </div>
            </div>
          )
        }
      ];
    } else if (isAdmin) {
      return [
        // Step 0: Welcome for Admin
        {
          title: `Bem-vindo ao MUDEAI, ${(userProfile as any)?.name || userProfile?.displayName || 'Administrador'}! 👔`,
          description: "Sua conta de administrador foi criada com sucesso. Você terá controle total da plataforma.",
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <p className="text-muted-foreground">
                  Como administrador, você terá acesso completo às configurações da plataforma
                  e poderá gerenciar toda a organização educacional.
                </p>
              </div>

              {tempPassword && (
                <Alert className="border-purple-200 bg-purple-50">
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Sua senha temporária:</strong>
                    <div className="mt-2 p-3 bg-white rounded border font-mono text-center">
                      {tempPassword}
                    </div>
                    <p className="text-sm mt-2 text-purple-700">
                      ⚠️ Guarde esta senha! Você pode alterá-la nas configurações da conta.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )
        },

        // Step 1: Admin-specific features
        {
          title: "Painel do Administrador",
          description: "Como administrador, você controla toda a plataforma e seus usuários.",
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <UserCheck className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-medium mb-1 text-purple-900">Gerenciar Professores</h3>
                  <p className="text-sm text-purple-800">
                    Convide, controle acessos e gerencie todos os professores da instituição.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <GraduationCap className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium mb-1 text-blue-900">Acompanhar Resultados</h3>
                  <p className="text-sm text-blue-800">
                    Visualize estatísticas completas, relatórios de alunos e métricas da instituição.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <Settings className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-medium mb-1 text-green-900">Configurações Avançadas</h3>
                  <p className="text-sm text-green-800">
                    Personalize questionários, configure notificações e ajuste permissões.
                  </p>
                </div>
                <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <Mail className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="font-medium mb-1 text-orange-900">Sistema de Emails</h3>
                  <p className="text-sm text-orange-800">
                    Configure templates de email, monitore envios e personalize comunicações.
                  </p>
                </div>
              </div>

              <Alert className="bg-purple-50 border-purple-200">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Poder Administrativo:</strong> Você pode convidar professores através de links
                  compartilháveis que funcionam em qualquer canal (WhatsApp, email, redes sociais).
                </AlertDescription>
              </Alert>
            </div>
          )
        },

        // Step 2: Getting started for admins
        {
          title: "Primeiros Passos como Administrador",
          description: "Vamos configurar sua instituição e começar a usar a plataforma!",
          content: (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-purple-100 text-purple-700">
                    1
                  </Badge>
                  <span className="text-sm">
                    Acesse "Professores" no menu lateral para começar
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-blue-100 text-blue-700">
                    2
                  </Badge>
                  <span className="text-sm">
                    Convide seus primeiros professores usando o botão "Convidar Professor"
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-green-100 text-green-700">
                    3
                  </Badge>
                  <span className="text-sm">
                    Copie os links de convite gerados e compartilhe com os professores
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-orange-100 text-orange-700">
                    4
                  </Badge>
                  <span className="text-sm">
                    Acompanhe o progresso no dashboard e configure notificações por email
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">🚀 Próximos Passos</h4>
                <p className="text-sm text-purple-800">
                  Comece convidando 2-3 professores para testar a plataforma.
                  Use os links de convite - eles são mais fáceis de compartilhar e rastrear!
                </p>
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
          <div className="flex justify-center mt-4">
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
