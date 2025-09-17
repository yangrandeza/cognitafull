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
  UserCheck
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

  const steps = [
    // Step 0: Welcome
    {
      title: `Bem-vindo ao MUDEAI, ${(userProfile as any)?.name || userProfile?.displayName || 'Usuário'}! 🎉`,
      description: isTeacher
        ? "Você foi convidado para fazer parte da nossa plataforma de avaliação psicopedagógica."
        : "Sua conta de administrador foi criada com sucesso.",
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
    },

    // Step 1: Role-specific information
    {
      title: isTeacher ? "Seu Papel como Professor" : "Seu Papel como Administrador",
      description: isTeacher
        ? "Como professor, você pode criar turmas e avaliar perfis de aprendizagem dos alunos."
        : "Como administrador, você pode gerenciar professores e acompanhar toda a organização.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isTeacher ? (
              <>
                <div className="p-4 border rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium mb-1">Criar Turmas</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure suas turmas e convide alunos para participar.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Users className="h-8 w-8 text-green-500 mb-2" />
                  <h3 className="font-medium mb-1">Avaliar Alunos</h3>
                  <p className="text-sm text-muted-foreground">
                    Acesse perfis psicométricos e personalize o ensino.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border rounded-lg">
                  <UserCheck className="h-8 w-8 text-purple-500 mb-2" />
                  <h3 className="font-medium mb-1">Gerenciar Professores</h3>
                  <p className="text-sm text-muted-foreground">
                    Convide e controle acesso dos professores da sua escola.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <GraduationCap className="h-8 w-8 text-orange-500 mb-2" />
                  <h3 className="font-medium mb-1">Acompanhar Resultados</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize relatórios e estatísticas de toda a organização.
                  </p>
                </div>
              </>
            )}
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {isTeacher
                ? "Seus alunos receberão automaticamente seus resultados por email após completar o questionário."
                : "Você pode convidar professores através de links compartilháveis via WhatsApp ou email."
              }
            </AlertDescription>
          </Alert>
        </div>
      )
    },

    // Step 2: Getting started
    {
      title: "Primeiros Passos",
      description: "Vamos começar a usar a plataforma!",
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                1
              </Badge>
              <span className="text-sm">
                {isTeacher ? "Acesse suas turmas no menu lateral" : "Convide seus primeiros professores"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                2
              </Badge>
              <span className="text-sm">
                {isTeacher ? "Configure uma nova turma" : "Configure as permissões dos professores"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
              <span className="text-sm">
                {isTeacher ? "Convide alunos para participar" : "Acompanhe os resultados das avaliações"}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dica Importante</h4>
            <p className="text-sm text-blue-800">
              {isTeacher
                ? "Cada aluno que completar o questionário receberá automaticamente seus resultados por email, incluindo seu perfil psicométrico personalizado."
                : "Use os links de convite para compartilhar convites via WhatsApp ou email - é mais fácil para os professores aceitarem!"
              }
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <CardDescription className="mt-2">
              {currentStepData.description}
            </CardDescription>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.content}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Pular Tutorial
            </Button>

            <Button
              onClick={nextStep}
              className="flex items-center gap-2"
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
