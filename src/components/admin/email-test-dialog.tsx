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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { emailService } from "@/lib/email-service";
import { sendEmailViaFirebase } from "@/lib/firebase/auth";
import { doc, getDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface EmailTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailTestDialog({ isOpen, onClose }: EmailTestDialogProps) {
  const [testEmail, setTestEmail] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) return;

    setLoading(true);
    try {
      const result = await sendEmailViaFirebase(
        testEmail,
        "Teste de Email - MUDEAI",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">🧪 Teste de Email</h1>
          <p>Este é um email de teste do sistema MUDEAI.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p>Se você recebeu este email, o sistema de envio está funcionando corretamente!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Sistema de teste - MUDEAI
          </p>
        </div>
        `
      );

      setResults(prev => [{
        type: 'custom',
        email: testEmail,
        success: result.success,
        messageId: result.messageId,
        timestamp: new Date(),
      }, ...prev]);

    } catch (error) {
      setResults(prev => [{
        type: 'custom',
        email: testEmail,
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (!testEmail.trim()) return;

    setLoading(true);
    try {
      // Load custom template from Firestore if exists
      const templatesRef = collection(db, 'emailTemplates');
      const templatesDoc = await getDoc(doc(templatesRef, 'templates'));
      let customTemplate = null;

      if (templatesDoc.exists()) {
        const data = templatesDoc.data();
        customTemplate = data.templates?.welcome;
      }

      let result;
      if (customTemplate) {
        // Use custom template with variable replacement
        let subject = customTemplate.subject.replace(/\{\{name\}\}/g, "Usuário de Teste");
        let html = customTemplate.html
          .replace(/\{\{name\}\}/g, "Usuário de Teste")
          .replace(/\{\{className\}\}/g, "Turma de Demonstração");

        result = await sendEmailViaFirebase(testEmail, subject, html);
      } else {
        // Use default template
        result = await emailService.sendWelcomeEmail(
          testEmail,
          "Usuário de Teste",
          "Turma de Demonstração"
        );
      }

      setResults(prev => [{
        type: 'welcome',
        email: testEmail,
        success: result.success,
        messageId: result.messageId,
        timestamp: new Date(),
        custom: !!customTemplate
      }, ...prev]);

    } catch (error) {
      setResults(prev => [{
        type: 'welcome',
        email: testEmail,
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuizResultsEmail = async () => {
    if (!testEmail.trim()) return;

    setLoading(true);
    try {
      // Load custom template from Firestore if exists
      const templatesRef = collection(db, 'emailTemplates');
      const templatesDoc = await getDoc(doc(templatesRef, 'templates'));
      let customTemplate = null;

      if (templatesDoc.exists()) {
        const data = templatesDoc.data();
        customTemplate = data.templates?.['quiz-results'];
      }

      let result;
      if (customTemplate) {
        // Use custom template with variable replacement
        let subject = customTemplate.subject
          .replace(/\{\{name\}\}/g, "João Silva")
          .replace(/\{\{className\}\}/g, "Turma A - 2025");
        let html = customTemplate.html
          .replace(/\{\{name\}\}/g, "João Silva")
          .replace(/\{\{className\}\}/g, "Turma A - 2025")
          .replace(/\{\{studentId\}\}/g, "student_123")
          .replace(/\{\{teacherName\}\}/g, "Prof. Maria Santos")
          .replace(/\{\{vark\}\}/g, "Visual")
          .replace(/\{\{disc\}\}/g, "Dominante")
          .replace(/\{\{jung\}\}/g, "INTJ")
          .replace(/\{\{schwartz\}\}/g, "Auto-realização")
          .replace(/\{\{whatsappNumber\}\}/g, "5511999999999");

        result = await sendEmailViaFirebase(testEmail, subject, html);
      } else {
        // Use default template
        result = await emailService.sendQuizResultsEmail(
          testEmail,
          "João Silva",
          "Turma A - 2025",
          "student_123",
          {
            vark: "Visual",
            disc: "Dominante",
            jung: "INTJ",
            schwartz: "Auto-realização"
          },
          "5511999999999"
        );
      }

      setResults(prev => [{
        type: 'quiz-results',
        email: testEmail,
        success: result.success,
        messageId: result.messageId,
        timestamp: new Date(),
        custom: !!customTemplate
      }, ...prev]);

    } catch (error) {
      setResults(prev => [{
        type: 'quiz-results',
        email: testEmail,
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTeacherInvitationEmail = async () => {
    if (!testEmail.trim()) return;

    setLoading(true);
    try {
      // Load custom template from Firestore if exists
      const templatesRef = collection(db, 'emailTemplates');
      const templatesDoc = await getDoc(doc(templatesRef, 'templates'));
      let customTemplate = null;

      if (templatesDoc.exists()) {
        const data = templatesDoc.data();
        customTemplate = data.templates?.['teacher-invitation'];
      }

      let result;
      if (customTemplate) {
        // Use custom template with variable replacement
        let subject = customTemplate.subject;
        let html = customTemplate.html
          .replace(/\{\{teacherName\}\}/g, "Maria Santos")
          .replace(/\{\{schoolName\}\}/g, "Escola Estadual São Paulo")
          .replace(/\{\{adminName\}\}/g, "Dr. João Silva")
          .replace(/\{\{invitationLink\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai.mudeeducacao.com.br'}/accept-invitation/demo-token`)
          .replace(/\{\{expiryDate\}\}/g, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'));

        result = await sendEmailViaFirebase(testEmail, subject, html);
      } else {
        // Use default template
        result = await emailService.sendTeacherInvitationEmail(
          testEmail,
          "Maria Santos",
          "Escola Estadual São Paulo",
          "Dr. João Silva",
          `${process.env.NEXT_PUBLIC_APP_URL || 'https://ai.mudeeducacao.com.br'}/accept-invitation/demo-token`,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        );
      }

      setResults(prev => [{
        type: 'teacher-invitation',
        email: testEmail,
        success: result.success,
        messageId: result.messageId,
        timestamp: new Date(),
        custom: !!customTemplate
      }, ...prev]);

    } catch (error) {
      setResults(prev => [{
        type: 'teacher-invitation',
        email: testEmail,
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!testEmail.trim() || !customSubject.trim() || !customContent.trim()) return;

    setLoading(true);
    try {
      const result = await sendEmailViaFirebase(
        testEmail,
        customSubject,
        customContent
      );

      setResults(prev => [{
        type: 'custom-html',
        email: testEmail,
        subject: customSubject,
        success: result.success,
        messageId: result.messageId,
        timestamp: new Date(),
      }, ...prev]);

    } catch (error) {
      setResults(prev => [{
        type: 'custom-html',
        email: testEmail,
        subject: customSubject,
        success: false,
        error: (error as Error).message,
        timestamp: new Date(),
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Teste do Sistema de Emails
          </DialogTitle>
          <DialogDescription>
            Teste diferentes tipos de emails para verificar se o sistema está funcionando corretamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Configuração de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração de Teste</CardTitle>
              <CardDescription>
                Digite o email que receberá os testes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-email">Email de Teste</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="teste@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Templates de Email</CardTitle>
              <CardDescription>
                Teste os templates pré-configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleSendTestEmail}
                  disabled={!testEmail.trim() || loading}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Send className="h-4 w-4" />
                    <span className="font-medium">Email de Teste Básico</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Envia um email simples para verificar se o sistema está funcionando
                  </p>
                </Button>

                <Button
                  onClick={handleSendWelcomeEmail}
                  disabled={!testEmail.trim() || loading}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email de Boas-vindas</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Template completo de boas-vindas para novos alunos
                  </p>
                </Button>

                <Button
                  onClick={handleSendQuizResultsEmail}
                  disabled={!testEmail.trim() || loading}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 w-full">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Resultados do Quiz</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Email completo com resultados do questionário e CTA para WhatsApp
                  </p>
                </Button>

                <Button
                  onClick={handleSendTeacherInvitationEmail}
                  disabled={!testEmail.trim() || loading}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  variant="outline"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Convite para Professor</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Template profissional de convite quando diretor cadastra professor
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quando os Emails São Enviados Automaticamente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📅 Quando os Emails São Enviados</CardTitle>
              <CardDescription>
                Entenda quando cada tipo de email é disparado automaticamente no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">🎓 Email de Boas-vindas</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          <strong>Quando:</strong> Automaticamente após um aluno completar o cadastro e confirmação de email
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                          Destinatário: Novo aluno • Acionamento: Sistema de autenticação
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 dark:text-green-100">🎉 Email de Resultados do Quiz</h4>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          <strong>Quando:</strong> Imediatamente após o processamento dos resultados do questionário psicométrico
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                          Destinatário: Aluno que completou o quiz • Acionamento: Sistema de avaliação
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900 dark:text-purple-100">👨‍🏫 Convite para Professor</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                          <strong>Quando:</strong> Quando um diretor/admin cadastra um novo professor no sistema
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-2">
                          Destinatário: Professor recém-cadastrado • Acionamento: Sistema de gestão de usuários
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-start gap-3">
                      <Send className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">📧 Notificações do Sistema</h4>
                        <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                          <strong>Quando:</strong> Quando professor conclui avaliação, lembretes, alertas de sistema
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                          Destinatários: Professores, alunos, admins • Acionamento: Vários pontos do sistema
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>💡 Importante:</strong> Todos os emails são enviados automaticamente pelo sistema.
                    Use esta tela de teste apenas para verificar se o sistema de email está funcionando corretamente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Personalizado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Personalizado</CardTitle>
              <CardDescription>
                Envie um email com conteúdo personalizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-subject">Assunto</Label>
                  <Input
                    id="custom-subject"
                    placeholder="Digite o assunto do email"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-content">Conteúdo HTML</Label>
                  <Textarea
                    id="custom-content"
                    placeholder="<h1>Olá!</h1><p>Este é um email de teste.</p>"
                    value={customContent}
                    onChange={(e) => setCustomContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleSendCustomEmail}
                  disabled={!testEmail.trim() || !customSubject.trim() || !customContent.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar Email Personalizado
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados */}
          {results.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Resultados dos Testes</CardTitle>
                  <CardDescription>
                    Histórico dos emails enviados
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={clearResults}>
                  Limpar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "Sucesso" : "Erro"}
                          </Badge>
                          <span className="text-sm font-medium">{result.type}</span>
                          <span className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleTimeString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Para: {result.email}
                        </p>
                        {result.subject && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Assunto: {result.subject}
                          </p>
                        )}
                        {result.success ? (
                          <div className="space-y-1">
                            <p className="text-xs text-green-600">
                              ✅ Message ID: {result.messageId}
                            </p>
                            <p className="text-xs text-green-600">
                              📧 Email enviado com sucesso! Verifique sua caixa de entrada.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              💡 Dica: Verifique também as pastas "Promoções" e "Spam/Junk"
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs text-red-600">
                              ❌ Erro: {result.error}
                            </p>
                            {result.details && (
                              <p className="text-xs text-red-500">
                                Detalhes: {result.details}
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p>🔧 Possíveis soluções:</p>
                              <ul className="list-disc list-inside ml-2 space-y-1">
                                <li>Verifique se o EMAIL_USER e EMAIL_PASS estão corretos no .env</li>
                                <li>Confirme se a senha de app do Gmail está ativa (não use senha normal)</li>
                                <li>Verifique se o Gmail não está bloqueando aplicações menos seguras</li>
                                <li>Teste com outro email destinatário</li>
                                <li>Verifique se o nodemailer está instalado: <code>npm install nodemailer</code></li>
                                <li>Confirme se as variáveis de ambiente estão carregadas</li>
                              </ul>
                              <p className="text-xs text-blue-600 mt-2">
                                💡 Verifique o console do navegador (F12) para mais detalhes técnicos
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
