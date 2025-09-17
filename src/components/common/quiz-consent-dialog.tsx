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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, FileText, Users, Database, Lock, Mail, Clock } from "lucide-react";

interface QuizConsentDialogProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function QuizConsentDialog({ isOpen, onAccept, onDecline }: QuizConsentDialogProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleAccept = () => {
    if (acceptedTerms) {
      onAccept();
      setAcceptedTerms(false); // Reset for next time
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="w-[95vw] max-w-4xl sm:max-w-5xl h-[90vh] sm:h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
            <span className="text-left">Termos de Privacidade e Consentimento - LGPD</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm lg:text-base mt-2">
            Antes de começar o questionário, é importante que você entenda como seus dados serão coletados, armazenados e utilizados.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full rounded-md border mx-4 sm:mx-6 mb-4 min-h-[300px] [&>[data-radix-scroll-area-viewport]]:max-h-none">
          <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6 text-xs sm:text-sm leading-relaxed pb-6">
            {/* Seção 1: O que coletamos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                1. Dados que coletamos
              </h3>
              <div className="pl-6 space-y-2">
                <p><strong>Informações pessoais:</strong> Nome, idade, e-mail e gênero (opcional)</p>
                <p><strong>Respostas do questionário:</strong> Suas respostas aos testes psicométricos (VARK, DISC, Jung, Schwartz)</p>
                <p><strong>Campos adicionais:</strong> Informações extras configuradas pelo professor da turma</p>
                <p><strong>Dados técnicos:</strong> Data e hora de participação, progresso no questionário</p>
              </div>
            </div>

            {/* Seção 2: Como usamos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                2. Como utilizamos seus dados
              </h3>
              <div className="pl-6 space-y-2">
                <p><strong>Análise de perfil de aprendizagem:</strong> Para gerar insights sobre seu estilo de aprendizagem</p>
                <p><strong>Relatórios para professores:</strong> Para que seu professor possa personalizar o ensino</p>
                <p><strong>Melhorias na plataforma:</strong> Para aprimorar nossos serviços educacionais</p>
                <p><strong>Pesquisa educacional:</strong> Para estudos sobre metodologias de ensino (dados anonimizados)</p>
              </div>
            </div>

            {/* Seção 3: Compartilhamento */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                3. Compartilhamento de dados
              </h3>
              <div className="pl-6 space-y-2">
                <p><strong>Com seu professor:</strong> Apenas os dados necessários para seu acompanhamento pedagógico</p>
                <p><strong>Com a instituição:</strong> Dados agregados e anonimizados para relatórios institucionais</p>
                <p><strong>Terceiros:</strong> Nunca compartilhamos seus dados pessoais com terceiros sem seu consentimento</p>
              </div>
            </div>

            {/* Seção 4: Segurança */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                4. Segurança dos dados
              </h3>
              <div className="pl-6 space-y-2">
                <p>Utilizamos criptografia para proteger seus dados durante transmissão e armazenamento</p>
                <p>Acesso restrito apenas às pessoas autorizadas (professor e administradores)</p>
                <p>Backups regulares e medidas de segurança contra vazamentos</p>
              </div>
            </div>

            {/* Seção 5: Seus direitos - LGPD */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                5. Seus direitos (LGPD)
              </h3>
              <div className="pl-6 space-y-2">
                <p><strong>Confirmação da existência:</strong> Direito de saber se processamos seus dados</p>
                <p><strong>Acesso:</strong> Direito de acessar seus dados pessoais</p>
                <p><strong>Correção:</strong> Direito de corrigir dados incompletos ou incorretos</p>
                <p><strong>Anonimização:</strong> Direito de tornar dados anonimizados</p>
                <p><strong>Portabilidade:</strong> Direito de transferir seus dados para outro fornecedor</p>
                <p><strong>Exclusão:</strong> Direito de solicitar a exclusão de seus dados</p>
                <p><strong>Revogação:</strong> Direito de revogar este consentimento a qualquer momento</p>
              </div>
            </div>

            {/* Seção 6: Contato */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                6. Contato e suporte
              </h3>
              <div className="pl-6 space-y-2">
                <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade:</p>
                <p><strong>E-mail:</strong> contato@mudeeducacao.com.br</p>
                <p><strong>Responsável:</strong> Encarregado de Dados - LGPD</p>
              </div>
            </div>

            {/* Seção 7: Retenção */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                7. Retenção de dados
              </h3>
              <div className="pl-6 space-y-2">
                <p>Seus dados pessoais serão mantidos apenas pelo tempo necessário para as finalidades descritas</p>
                <p>Dados acadêmicos podem ser mantidos por até 5 anos após sua conclusão do curso</p>
                <p>Você pode solicitar a exclusão antecipada a qualquer momento</p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Checkbox de aceite */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t bg-background">
          <div className="flex items-start space-x-3 mb-4">
            <Checkbox
              id="accept-terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
              className="mt-1 flex-shrink-0"
            />
            <label
              htmlFor="accept-terms"
              className="text-xs sm:text-sm leading-relaxed cursor-pointer flex-1"
            >
              <strong>Declaro que li e concordo</strong> com os termos de privacidade e tratamento de dados pessoais
              descritos acima, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              Entendo que posso revogar este consentimento a qualquer momento.
            </label>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={onDecline}
              className="w-full sm:w-auto px-4 sm:px-6 order-2 sm:order-1"
            >
              Recusar
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!acceptedTerms}
              className="w-full sm:w-auto px-4 sm:px-6 order-1 sm:order-2"
            >
              Aceitar e Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
