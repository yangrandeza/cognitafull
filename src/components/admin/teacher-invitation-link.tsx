"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Share2, Mail, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeacherInvitationLinkProps {
  teacherId: string;
  invitationLink: string;
  teacherName: string;
  teacherEmail: string;
  expiresAt: string;
  emailSent: boolean;
}

export function TeacherInvitationLink({
  teacherId,
  invitationLink,
  teacherName,
  teacherEmail,
  expiresAt,
  emailSent
}: TeacherInvitationLinkProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link de convite foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link. Tente novamente.",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Olá ${teacherName}! Você foi convidado para fazer parte da plataforma MUDEAI como professor. Clique no link para aceitar o convite: ${invitationLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = "Convite para Professor - MUDEAI";
    const body = `Olá ${teacherName}!

Você foi convidado para fazer parte da plataforma MUDEAI como professor.

Para aceitar o convite, clique no link abaixo:
${invitationLink}

Este link é válido por 7 dias.

Atenciosamente,
Equipe MUDEAI`;

    const emailUrl = `mailto:${teacherEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Link de Convite Criado
        </CardTitle>
        <CardDescription>
          Compartilhe este link com o professor para que ele possa aceitar o convite
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Teacher Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Professor</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {teacherName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{teacherName}</p>
                <p className="text-sm text-muted-foreground">{teacherEmail}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status do Convite</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Pendente
              </Badge>
              {emailSent && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Mail className="h-3 w-3 mr-1" />
                  Email enviado
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Expira em: {formatExpiryDate(expiresAt)}
            </p>
          </div>
        </div>

        {/* Invitation Link */}
        <div className="space-y-2">
          <Label htmlFor="invitation-link" className="text-sm font-medium">
            Link de Convite
          </Label>
          <div className="flex gap-2">
            <Input
              id="invitation-link"
              value={invitationLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Este link pode ser compartilhado via WhatsApp, email, redes sociais ou qualquer outro canal
          </p>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Compartilhar Convite</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={shareViaWhatsApp}
              variant="outline"
              className="flex items-center gap-2 h-auto p-4"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">W</span>
              </div>
              <div className="text-left">
                <p className="font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">Compartilhar via WhatsApp</p>
              </div>
            </Button>

            <Button
              onClick={shareViaEmail}
              variant="outline"
              className="flex items-center gap-2 h-auto p-4"
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium">Email</p>
                <p className="text-xs text-muted-foreground">Enviar por email</p>
              </div>
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <Alert>
          <Share2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Instruções:</strong> Compartilhe este link com o professor através do canal de sua preferência.
            Quando ele clicar no link, será redirecionado para uma página onde poderá aceitar o convite e criar sua conta.
          </AlertDescription>
        </Alert>

        {/* Additional Info */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Sobre o Processo de Convite
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• O professor receberá automaticamente um email de convite (se configurado)</li>
            <li>• O link pode ser compartilhado em qualquer canal (WhatsApp, SMS, redes sociais)</li>
            <li>• O link é válido por 7 dias a partir da criação</li>
            <li>• Uma vez aceito, o professor terá acesso completo à plataforma</li>
            <li>• O status do convite muda automaticamente para "ativo"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
