"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { emailTemplates } from "@/lib/email-service";
import {
  Mail,
  CheckCircle,
  Users,
  FileText,
  Save,
  Eye,
  RotateCcw,
  Send,
  Loader2
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[];
  lastModified: Date;
}

// MUDEAI Official Colors - Templates with correct branding
const defaultTemplates = {
  welcome: {
    id: "welcome",
    name: "Boas-vindas",
    subject: "🎓 Bem-vindo ao MUDEAI - Sua Jornada de Aprendizagem Começa Agora!",
    html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #884cff 0%, #ec9b2a 100%); padding: 40px 30px; text-align: center; position: relative;">
    <div style="position: absolute; top: 20px; left: 20px; background: white; border-radius: 8px; padding: 8px;">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.svg" alt="MUDEAI Logo" style="height: 32px; width: auto;">
    </div>
    <div style="margin-top: 20px;">
      <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">🎓 Bem-vindo, {{name}}!</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Sua jornada de aprendizagem começa agora</p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px 30px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0; font-weight: 600;">Descubra Seu Potencial</h2>
      <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">O MUDEAI está aqui para transformar sua experiência de aprendizagem</p>
    </div>

    <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
      <h3 style="color: #7c3aed; margin: 0; font-size: 18px;">🎓 Sua Turma</h3>
      <p style="color: #7c3aed; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">{{className}}</p>
    </div>

    <!-- Features -->
    <div style="margin-bottom: 30px;">
      <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">✨ O que você pode fazer:</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div style="background: #f2ecf6; border-radius: 8px; padding: 15px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
          <p style="margin: 0; font-size: 14px; color: #374151;">Descobrir seu perfil de aprendizagem</p>
        </div>
        <div style="background: #f2ecf6; border-radius: 8px; padding: 15px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
          <p style="margin: 0; font-size: 14px; color: #374151;">Acompanhar seu progresso</p>
        </div>
        <div style="background: #f2ecf6; border-radius: 8px; padding: 15px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
          <p style="margin: 0; font-size: 14px; color: #374151;">Personalizar sua aprendizagem</p>
        </div>
        <div style="background: #f2ecf6; border-radius: 8px; padding: 15px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🚀</div>
          <p style="margin: 0; font-size: 14px; color: #374151;">Alcançar seus objetivos</p>
        </div>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 8px 25px rgba(236, 155, 42, 0.3); transition: all 0.3s ease;">
        🚀 Começar Minha Jornada
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        🎓 <strong>MUDEAI</strong> - Transformando o aprendizado através da inteligência artificial
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
        Dúvidas? Entre em contato: suporte@ai.mudeeducacao.com.br
      </p>
    </div>
  </div>
</div>`,
    variables: ["name", "className"],
    lastModified: new Date()
  },
  "quiz-results": {
    id: "quiz-results",
    name: "Resultados do Quiz",
    subject: "🎉 {{name}}, seus resultados do questionário estão prontos! - {{className}}",
    html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #884cff 0%, #ec9b2a 100%); padding: 40px 30px; text-align: center; position: relative;">
    <div style="position: absolute; top: 20px; left: 20px; background: white; border-radius: 8px; padding: 8px;">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.svg" alt="MUDEAI Logo" style="height: 32px; width: auto;">
    </div>
    <div style="margin-top: 20px;">
      <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">🎉 Parabéns, {{name}}!</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Seus resultados da turma <strong>{{className}}</strong> estão prontos!</p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px 30px;">
    <!-- Class Info -->
    <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
      <h3 style="color: #7c3aed; margin: 0; font-size: 18px;">📚 Informações da Turma</h3>
      <p style="color: #7c3aed; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">{{className}}</p>
      <p style="color: #7c3aed; margin: 4px 0 0 0; font-size: 14px;">Professor(a): {{teacherName}}</p>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0; font-weight: 600;">Descubra Seu Perfil de Aprendizagem</h2>
      <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">Analisamos seus superpoderes únicos baseados no questionário!</p>
    </div>

    <!-- Results Cards -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #f59e0b;">
        <div style="font-size: 24px; margin-bottom: 8px;">🧠</div>
        <h3 style="color: #92400e; font-size: 16px; margin: 0; font-weight: 600;">Estilo VARK</h3>
        <p style="color: #92400e; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">{{vark}}</p>
      </div>

      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #3b82f6;">
        <div style="font-size: 24px; margin-bottom: 8px;">🎭</div>
        <h3 style="color: #1e40af; font-size: 16px; margin: 0; font-weight: 600;">Perfil DISC</h3>
        <p style="color: #1e40af; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">{{disc}}</p>
      </div>

      <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #ec4899;">
        <div style="font-size: 24px; margin-bottom: 8px;">🔮</div>
        <h3 style="color: #be185d; font-size: 16px; margin: 0; font-weight: 600;">Tipo Jung</h3>
        <p style="color: #be185d; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">{{jung}}</p>
      </div>

      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #10b981;">
        <div style="font-size: 24px; margin-bottom: 8px;">🌟</div>
        <h3 style="color: #047857; font-size: 16px; margin: 0; font-weight: 600;">Valores Schwartz</h3>
        <p style="color: #047857; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">{{schwartz}}</p>
      </div>
    </div>

    <!-- Personal Message -->
    <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #d8b4fe;">
      <div style="text-align: center;">
        <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">💌 Mensagem Personalizada</h3>
        <p style="color: #7c3aed; margin: 0; font-size: 16px; line-height: 1.6;">
          Olá <strong>{{name}}</strong>! Parabéns por completar o questionário da turma <strong>{{className}}</strong>.
          Seus resultados mostram um perfil único de aprendizagem que será fundamental para seu desenvolvimento acadêmico.
          Seu professor(a) {{teacherName}} poderá usar essas informações para personalizar suas aulas.
        </p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/{{studentId}}"
         style="background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 8px 25px rgba(236, 155, 42, 0.3); transition: all 0.3s ease;">
        🚀 Ver Meus Resultados Completos
      </a>
    </div>

    <!-- WhatsApp CTA -->
    <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); border-radius: 12px;">
      <h3 style="color: white; margin: 0 0 10px 0; font-size: 18px;">💬 Precisa da Plataforma para Sua Escola?</h3>
      <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0; font-size: 14px;">
        Fale conosco e leve o MUDEAI para sua instituição! Seus resultados mostram o potencial da nossa plataforma.
      </p>
      <a href="https://wa.me/{{whatsappNumber}}?text=Olá! Acabei de ver meus resultados no MUDEAI da turma {{className}} e gostaria de saber mais sobre levar a plataforma para minha escola."
         style="background: white; color: #25d366; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
        📱 Falar no WhatsApp
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        🎓 <strong>MUDEAI</strong> - Transformando o aprendizado através da inteligência artificial
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
        Seus dados estão seguros conosco • LGPD Compliant • Resultado personalizado para {{name}}
      </p>
    </div>
  </div>
</div>`,
    variables: ["name", "className", "studentId", "teacherName", "vark", "disc", "jung", "schwartz", "whatsappNumber"],
    lastModified: new Date()
  },
  "teacher-invitation": {
    id: "teacher-invitation",
    name: "Convite para Professor",
    subject: "🎓 Convite para Professor - MUDEAI",
    html: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #884cff 0%, #ec9b2a 100%); padding: 40px 30px; text-align: center; position: relative;">
    <div style="position: absolute; top: 20px; left: 20px; background: white; border-radius: 8px; padding: 8px;">
      <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.svg" alt="MUDEAI Logo" style="height: 32px; width: auto;">
    </div>
    <div style="margin-top: 20px;">
      <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">👨‍🏫 Bem-vindo, Professor!</h1>
      <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Você foi convidado para o MUDEAI</p>
    </div>
  </div>

  <!-- Content -->
  <div style="background: white; padding: 40px 30px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #1f2937; font-size: 24px; margin: 0; font-weight: 600;">Olá, {{teacherName}}!</h2>
      <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">
        <strong>{{adminName}}</strong> da <strong>{{schoolName}}</strong> convidou você para fazer parte do MUDEAI!
      </p>
    </div>

    <!-- Invitation Card -->
    <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #d8b4fe;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
        <h3 style="color: #7c3aed; font-size: 20px; margin: 0; font-weight: 600;">Plataforma de Avaliação Psicopedagógica</h3>
      </div>

      <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">O que você pode fazer:</h4>
        <ul style="color: #6b7280; padding-left: 20px; margin: 0; line-height: 1.6;">
          <li>📊 Avaliar perfis de aprendizagem dos alunos</li>
          <li>📈 Gerar relatórios detalhados e insights</li>
          <li>🎯 Personalizar metodologias de ensino</li>
          <li>📚 Acompanhar progresso individual</li>
          <li>🤝 Colaborar com outros professores</li>
        </ul>
      </div>

      <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 8px; padding: 15px; border: 1px solid #d8b4fe;">
        <p style="color: #7c3aed; margin: 0; font-size: 14px; text-align: center;">
          <strong>⚡ Válido até:</strong> {{expiryDate}}
        </p>
      </div>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitationLink}}"
         style="background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 8px 25px rgba(236, 155, 42, 0.3); transition: all 0.3s ease;">
        🚀 Aceitar Convite e Começar
      </a>
    </div>

    <!-- Instructions -->
    <div style="background: #f2ecf6; border-radius: 12px; padding: 25px; margin-bottom: 20px;">
      <h4 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 18px;">📋 Como começar:</h4>
      <ol style="color: #6b7280; padding-left: 20px; margin: 0; line-height: 1.6;">
        <li>Clique no botão "Aceitar Convite" acima</li>
        <li>Complete seu cadastro com suas informações</li>
        <li>Configure seu perfil de professor</li>
        <li>Comece a avaliar seus alunos!</li>
      </ol>
    </div>

    <!-- Support -->
    <div style="text-align: center; margin: 30px 0;">
      <p style="color: #6b7280; margin: 0 0 10px 0;">
        Precisa de ajuda? Nossa equipe está aqui para você!
      </p>
      <div style="display: flex; justify-content: center; gap: 10px;">
        <a href="mailto:suporte@ai.mudeeducacao.com.br"
           style="background: #6b7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-size: 14px;">
          📧 Email
        </a>
        <a href="https://wa.me/5511999999999?text=Olá! Recebi o convite para professor no MUDEAI e preciso de ajuda."
           style="background: #25d366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; font-size: 14px;">
          💬 WhatsApp
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        🎓 <strong>MUDEAI</strong> - Transformando o aprendizado através da inteligência artificial
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
        Este convite é pessoal e intransferível
      </p>
    </div>
  </div>
</div>`,
    variables: ["teacherName", "schoolName", "adminName", "invitationLink", "expiryDate"],
    lastModified: new Date()
  }
};

export function EmailTemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("welcome");
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>({});
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const { toast } = useToast();

  // Load templates from Firestore
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesRef = collection(db, 'emailTemplates');
      const templatesDoc = await getDoc(doc(templatesRef, 'templates'));

      if (templatesDoc.exists()) {
        const data = templatesDoc.data();
        setTemplates(data.templates || {});
      } else {
        // Initialize with default templates
        await setDoc(doc(templatesRef, 'templates'), {
          templates: defaultTemplates,
          lastUpdated: serverTimestamp()
        });
        setTemplates(defaultTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates de email.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load template content when selected template changes
  useEffect(() => {
    if (templates[selectedTemplate]) {
      setSubject(templates[selectedTemplate].subject);
      setHtmlContent(templates[selectedTemplate].html);
    } else if (defaultTemplates[selectedTemplate as keyof typeof defaultTemplates]) {
      const defaultTemplate = defaultTemplates[selectedTemplate as keyof typeof defaultTemplates];
      setSubject(defaultTemplate.subject);
      setHtmlContent(defaultTemplate.html);
    }
  }, [selectedTemplate, templates]);

  // Initialize on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Save template to Firestore
  const saveTemplate = async () => {
    try {
      setSaving(true);
      const templatesRef = collection(db, 'emailTemplates');

      const updatedTemplates = {
        ...templates,
        [selectedTemplate]: {
          id: selectedTemplate,
          name: defaultTemplates[selectedTemplate as keyof typeof defaultTemplates]?.name || selectedTemplate,
          subject,
          html: htmlContent,
          variables: defaultTemplates[selectedTemplate as keyof typeof defaultTemplates]?.variables || [],
          lastModified: new Date()
        }
      };

      await setDoc(doc(templatesRef, 'templates'), {
        templates: updatedTemplates,
        lastUpdated: serverTimestamp()
      });

      setTemplates(updatedTemplates);

      toast({
        title: "Template salvo",
        description: `Template "${selectedTemplate}" foi salvo com sucesso.`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o template.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Restore template to default
  const restoreTemplate = () => {
    const defaultTemplate = defaultTemplates[selectedTemplate as keyof typeof defaultTemplates];
    if (defaultTemplate) {
      setSubject(defaultTemplate.subject);
      setHtmlContent(defaultTemplate.html);
      toast({
        title: "Template restaurado",
        description: "Template restaurado para a versão padrão com cores oficiais MUDEAI.",
      });
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Digite um email para enviar o teste.",
      });
      return;
    }

    try {
      setSendingTest(true);

      // Replace variables with test data
      let testSubject = subject;
      let testHtml = htmlContent;

      // Replace common variables with test data
      const testData = {
        name: "João Silva",
        email: testEmail,
        className: "Turma A - 2025",
        studentId: "student_123",
        teacherName: "Prof. Maria Santos",
        schoolName: "Escola Estadual São Paulo",
        adminName: "Diretor Carlos",
        invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/test-token`,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        vark: "Visual",
        disc: "Dominante",
        jung: "INTJ",
        schwartz: "Auto-realização",
        whatsappNumber: "5511999999999"
      };

      Object.entries(testData).forEach(([key, value]) => {
        testSubject = testSubject.replace(new RegExp(`{{${key}}}`, 'g'), value);
        testHtml = testHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // Send test email
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          subject: testSubject,
          htmlContent: testHtml,
          templateId: selectedTemplate
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Email de teste enviado",
          description: `Email enviado para ${testEmail} com template editado.`,
        });
      } else {
        throw new Error(result.error || 'Erro ao enviar email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar teste",
        description: "Não foi possível enviar o email de teste.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Generate preview HTML
  const generatePreview = () => {
    let previewSubject = subject;
    let previewHtml = htmlContent;

    const previewData = {
      name: "João Silva",
      email: testEmail || "teste@email.com",
      className: "Turma A - 2025",
      studentId: "student_123",
      teacherName: "Prof. Maria Santos",
      schoolName: "Escola Estadual São Paulo",
      adminName: "Diretor Carlos",
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/test-token`,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      vark: "Visual",
      disc: "Dominante",
      jung: "INTJ",
      schwartz: "Auto-realização",
      whatsappNumber: "5511999999999"
    };

    Object.entries(previewData).forEach(([key, value]) => {
      previewSubject = previewSubject.replace(new RegExp(`{{${key}}}`, 'g'), value);
      previewHtml = previewHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return { subject: previewSubject, html: previewHtml };
  };

  const preview = generatePreview();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando editor de templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editor de Templates de Email - MUDEAI</CardTitle>
          <CardDescription>
            Edite os templates de email com as cores oficiais da marca MUDEAI (#ec9b2a, #884cff, #f2ecf6)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={selectedTemplate === "welcome" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedTemplate("welcome")}
              >
                <Mail className="h-6 w-6 text-blue-600" />
                <span>Boas-vindas</span>
              </Button>
              <Button
                variant={selectedTemplate === "quiz-results" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedTemplate("quiz-results")}
              >
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span>Resultados Quiz</span>
              </Button>
              <Button
                variant={selectedTemplate === "teacher-invitation" ? "default" : "outline"}
                className="h-20 flex flex-col gap-2"
                onClick={() => setSelectedTemplate("teacher-invitation")}
              >
                <Users className="h-6 w-6 text-purple-600" />
                <span>Convite Professor</span>
              </Button>
            </div>

            {/* Template Editor */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">
                Editando: {defaultTemplates[selectedTemplate as keyof typeof defaultTemplates]?.name || selectedTemplate}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-subject">Assunto do Email</Label>
                  <Input
                    id="template-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Digite o assunto do email"
                  />
                </div>

                <div>
                  <Label htmlFor="template-content">Conteúdo HTML</Label>
                  <Textarea
                    id="template-content"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Digite o conteúdo HTML do email..."
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={saveTemplate} disabled={saving} className="flex items-center gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar Template
                  </Button>

                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preview do Email - Cores MUDEAI</DialogTitle>
                        <DialogDescription>
                          Visualização do email com dados de exemplo e cores oficiais
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Assunto:</Label>
                          <p className="text-sm bg-muted p-2 rounded">{preview.subject}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Conteúdo:</Label>
                          <div
                            className="border rounded p-4 max-h-96 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: preview.html }}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" onClick={restoreTemplate} className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Restaurar Padrão (Cores MUDEAI)
                  </Button>
                </div>

                {/* Test Email Section */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Enviar Email de Teste</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite um email para teste..."
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      type="email"
                    />
                    <Button
                      onClick={sendTestEmail}
                      disabled={sendingTest || !testEmail.trim()}
                      className="flex items-center gap-2"
                    >
                      {sendingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Enviar Teste
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* MUDEAI Colors Reference */}
            <div className="bg-gradient-to-r from-orange-100 to-purple-100 dark:from-orange-950/20 dark:to-purple-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">🎨 Cores Oficiais MUDEAI</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-[#ec9b2a] mx-auto mb-2 border-2 border-white shadow-lg"></div>
                  <p className="font-mono text-xs">#ec9b2a</p>
                  <p className="text-xs text-muted-foreground">Laranja/Âmbar</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-[#884cff] mx-auto mb-2 border-2 border-white shadow-lg"></div>
                  <p className="font-mono text-xs">#884cff</p>
                  <p className="text-xs text-muted-foreground">Roxo Principal</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full bg-[#f2ecf6] mx-auto mb-2 border-2 border-gray-300 shadow-lg"></div>
                  <p className="font-mono text-xs">#f2ecf6</p>
                  <p className="text-xs text-muted-foreground">Roxo Claro</p>
                </div>
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-2">
                💡 Todos os templates usam essas cores oficiais da marca MUDEAI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
