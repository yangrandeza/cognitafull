// Email Service using Firebase
// This service provides easy-to-use functions for sending emails

import { sendEmailViaFirebase, sendEmailViaExtension } from './firebase/auth';

// Email templates with MUDEAI official colors
export const emailTemplates = {
  welcome: (data: { name: string; className?: string }) => ({
    subject: '🎓 Bem-vindo ao MUDEAI - Sua Jornada de Aprendizagem Começa Agora!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #884cff 0%, #ec9b2a 100%); padding: 40px 30px; text-align: center; position: relative;">
          <div style="position: absolute; top: 20px; left: 20px; background: white; border-radius: 8px; padding: 8px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.svg" alt="MUDEAI Logo" style="height: 32px; width: auto;">
          </div>
          <div style="margin-top: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">🎓 Bem-vindo, ${data.name}!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Sua jornada de aprendizagem começa agora</p>
          </div>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 40px 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1f2937; font-size: 24px; margin: 0; font-weight: 600;">Descubra Seu Potencial</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">O MUDEAI está aqui para transformar sua experiência de aprendizagem</p>
          </div>

          ${data.className ? `
          <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #7c3aed; margin: 0; font-size: 18px;">🎓 Sua Turma</h3>
            <p style="color: #7c3aed; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">${data.className}</p>
          </div>
          ` : ''}

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
              Dúvidas? Entre em contato: contato@mudeeducacao.com.br
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  quizResults: (data: {
    name: string;
    className: string;
    studentId: string;
    teacherName?: string;
    quizResults: {
      vark: string;
      disc: string;
      jung: string;
      schwartz: string;
    };
    whatsappNumber?: string;
  }) => ({
    subject: `🎉 ${data.name}, seus resultados do questionário estão prontos! - ${data.className}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #884cff 0%, #ec9b2a 100%); padding: 40px 30px; text-align: center; position: relative;">
          <div style="position: absolute; top: 20px; left: 20px; background: white; border-radius: 8px; padding: 8px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.svg" alt="MUDEAI Logo" style="height: 32px; width: auto;">
          </div>
          <div style="margin-top: 20px;">
            <h1 style="color: white; font-size: 28px; margin: 0; font-weight: 700;">🎉 Parabéns, ${data.name}!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">Seus resultados da turma <strong>${data.className}</strong> estão prontos!</p>
          </div>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 40px 30px;">
          <!-- Class Info -->
          <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: #7c3aed; margin: 0; font-size: 18px;">📚 Informações da Turma</h3>
            <p style="color: #7c3aed; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">${data.className}</p>
            ${data.teacherName ? `<p style="color: #7c3aed; margin: 4px 0 0 0; font-size: 14px;">Professor(a): ${data.teacherName}</p>` : ''}
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
              <p style="color: #92400e; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">${data.quizResults.vark}</p>
            </div>

            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #3b82f6;">
              <div style="font-size: 24px; margin-bottom: 8px;">🎭</div>
              <h3 style="color: #1e40af; font-size: 16px; margin: 0; font-weight: 600;">Perfil DISC</h3>
              <p style="color: #1e40af; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">${data.quizResults.disc}</p>
            </div>

            <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #ec4899;">
              <div style="font-size: 24px; margin-bottom: 8px;">🔮</div>
              <h3 style="color: #be185d; font-size: 16px; margin: 0; font-weight: 600;">Tipo Jung</h3>
              <p style="color: #be185d; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">${data.quizResults.jung}</p>
            </div>

            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 20px; text-align: center; border: 2px solid #10b981;">
              <div style="font-size: 24px; margin-bottom: 8px;">🌟</div>
              <h3 style="color: #047857; font-size: 16px; margin: 0; font-weight: 600;">Valores Schwartz</h3>
              <p style="color: #047857; font-size: 18px; margin: 8px 0 0 0; font-weight: 700;">${data.quizResults.schwartz}</p>
            </div>
          </div>

          <!-- Personal Message -->
          <div style="background: linear-gradient(135deg, #f2ecf6 0%, #e9d5ff 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #d8b4fe;">
            <div style="text-align: center;">
              <h3 style="color: #7c3aed; margin: 0 0 10px 0; font-size: 18px;">💌 Mensagem Personalizada</h3>
              <p style="color: #7c3aed; margin: 0; font-size: 16px; line-height: 1.6;">
                Olá <strong>${data.name}</strong>! Parabéns por completar o questionário da turma <strong>${data.className}</strong>.
                Seus resultados mostram um perfil único de aprendizagem que será fundamental para seu desenvolvimento acadêmico.
                ${data.teacherName ? `Seu professor(a) ${data.teacherName} poderá usar essas informações para personalizar suas aulas.` : ''}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/${data.studentId}"
               style="background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 8px 25px rgba(236, 155, 42, 0.3); transition: all 0.3s ease;">
              🚀 Ver Meus Resultados Completos
            </a>
          </div>

          <!-- WhatsApp CTA -->
          ${data.whatsappNumber ? `
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #25d366 0%, #128c7e 100%); border-radius: 12px;">
            <h3 style="color: white; margin: 0 0 10px 0; font-size: 18px;">💬 Precisa da Plataforma para Sua Escola?</h3>
            <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0; font-size: 14px;">
              Fale conosco e leve o MUDEAI para sua instituição! Seus resultados mostram o potencial da nossa plataforma.
            </p>
            <a href="https://wa.me/${data.whatsappNumber}?text=Olá! Acabei de ver meus resultados no MUDEAI da turma ${data.className} e gostaria de saber mais sobre levar a plataforma para minha escola."
               style="background: white; color: #25d366; padding: 12px 24px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              📱 Falar no WhatsApp
            </a>
          </div>
          ` : ''}

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              🎓 <strong>MUDEAI</strong> - Transformando o aprendizado através da inteligência artificial
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              Seus dados estão seguros conosco • LGPD Compliant • Resultado personalizado para ${data.name}
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  teacherInvitation: (data: {
    teacherName: string;
    schoolName: string;
    adminName: string;
    invitationLink: string;
    expiryDate: string;
  }) => ({
    subject: '🎓 Convite para Professor - MUDEAI',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
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
            <h2 style="color: #1f2937; font-size: 24px; margin: 0; font-weight: 600;">Olá, ${data.teacherName}!</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0 0;">
              <strong>${data.adminName}</strong> da <strong>${data.schoolName}</strong> convidou você para fazer parte do MUDEAI!
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
                <strong>⚡ Válido até:</strong> ${new Date(data.expiryDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.invitationLink}"
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
              <a href="mailto:contato@mudeeducacao.com.br"
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
      </div>
    `,
  }),
};

// Easy-to-use email functions
export const emailService = {
  // Send welcome email to new student
  async sendWelcomeEmail(email: string, name: string, className?: string) {
    const template = emailTemplates.welcome({ name, className });
    return await sendEmailViaFirebase(email, template.subject, template.html);
  },

  // Send quiz results email to student
  async sendQuizResultsEmail(
    email: string,
    name: string,
    className: string,
    studentId: string,
    quizResults: {
      vark: string;
      disc: string;
      jung: string;
      schwartz: string;
    },
    whatsappNumber?: string,
    teacherName?: string
  ) {
    const template = emailTemplates.quizResults({
      name,
      className,
      studentId,
      teacherName,
      quizResults,
      whatsappNumber
    });
    return await sendEmailViaFirebase(email, template.subject, template.html);
  },

  // Send teacher invitation email
  async sendTeacherInvitationEmail(
    email: string,
    teacherName: string,
    schoolName: string,
    adminName: string,
    invitationLink: string,
    expiryDate: string
  ) {
    const template = emailTemplates.teacherInvitation({
      teacherName,
      schoolName,
      adminName,
      invitationLink,
      expiryDate
    });
    return await sendEmailViaFirebase(email, template.subject, template.html);
  },

  // Send custom email
  async sendCustomEmail(email: string, subject: string, htmlContent: string) {
    return await sendEmailViaFirebase(email, subject, htmlContent);
  },

  // Send email using Firebase Extensions (requires Trigger Email extension)
  async sendTemplatedEmail(email: string, templateId: string, templateData: any) {
    return await sendEmailViaExtension(email, templateId, templateData);
  },
};
