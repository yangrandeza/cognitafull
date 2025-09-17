# Sistema de Envio de Emails com Firebase

Este guia explica como configurar e usar o sistema de envio de emails integrado ao Firebase, sem necessidade de SMTP adicional.

## 🚀 Métodos Disponíveis

### 1. **Firebase Cloud Functions** (Recomendado)
- Usa Cloud Functions para processar emails
- Suporte a Gmail, SendGrid, Mailgun, etc.
- Fila automática de emails
- Rastreamento de status

### 2. **Firebase Extensions** (Simples)
- Extensão "Trigger Email" do Firebase
- Templates pré-configurados
- Sem necessidade de código adicional

## 📋 Pré-requisitos

1. **Projeto Firebase** configurado
2. **Conta de email** (Gmail, SendGrid, etc.)
3. **Variáveis de ambiente** configuradas

## ⚙️ Configuração

### Passo 1: Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Configure as variáveis:

```env
# Para Gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=noreply@mudeai.com

# Para SendGrid (alternativo)
SENDGRID_API_KEY=sua_api_key_sendgrid

# URL da aplicação
NEXT_PUBLIC_APP_URL=https://mudeai.com
```

### Passo 2: Configurar Firebase Cloud Functions

1. **Instalar Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Inicializar Functions:**
```bash
firebase init functions
```

3. **Instalar dependências:**
```bash
cd functions
npm install nodemailer @google-cloud/firestore
```

4. **Configurar credenciais:**
```bash
# Para Gmail
firebase functions:config:set email.user="seu_email@gmail.com"
firebase functions:config:set email.pass="sua_senha_de_app"
firebase functions:config:set email.from="noreply@mudeai.com"

# Para SendGrid
firebase functions:config:set sendgrid.key="sua_api_key"
```

5. **Deploy das Functions:**
```bash
firebase deploy --only functions
```

## 📧 Como Usar

### Uso Básico

```typescript
import { emailService } from '@/lib/email-service';

// Enviar email de boas-vindas
await emailService.sendWelcomeEmail(
  'aluno@email.com',
  'João Silva',
  'Turma A'
);

// Notificar conclusão do questionário
await emailService.sendQuizCompletedEmail(
  'aluno@email.com',
  'João Silva',
  'Turma A',
  'student_id_123'
);

// Notificar professor
await emailService.sendTeacherNotification(
  'professor@email.com',
  'Maria Santos',
  'João Silva',
  'Turma A',
  'class_id_456'
);
```

### Uso Avançado

```typescript
import { sendEmailViaFirebase } from '@/lib/firebase/auth';

// Email personalizado
const result = await sendEmailViaFirebase(
  'destinatario@email.com',
  'Assunto Personalizado',
  '<h1>Conteúdo HTML</h1><p>Email personalizado!</p>'
);

if (result.success) {
  console.log('Email enviado:', result.messageId);
}
```

## 🔧 Configurações de Email

### Gmail (Recomendado para Início)

1. **Ativar verificação em 2 etapas**
2. **Gerar senha de app:**
   - Google Account → Segurança → Senhas de app
   - Selecionar "Mail" e "Outro"
   - Usar a senha gerada no `EMAIL_PASS`

### SendGrid (Para Produção)

1. **Criar conta** em [SendGrid](https://sendgrid.com)
2. **Gerar API Key** nas configurações
3. **Verificar domínio** (recomendado)
4. **Configurar** `SENDGRID_API_KEY`

## 📊 Monitoramento

### Verificar Status dos Emails

```typescript
// Consultar coleção 'emailQueue' no Firestore
// Status possíveis: 'pending', 'sent', 'failed'
```

### Logs das Functions

```bash
firebase functions:log
```

## 🎨 Templates de Email

Os templates incluem:

- **🎓 Boas-vindas** - Para novos alunos
- **✅ Questionário concluído** - Notificação de conclusão
- **👨‍🏫 Notificação para professor** - Quando aluno completa
- **🚫 Registro bloqueado** - Quando inscrições estão desabilitadas

## 🔒 Segurança

- **Credenciais seguras** no Firebase Functions Config
- **Validação de entrada** em todas as funções
- **Rate limiting** pode ser implementado
- **Logs de auditoria** disponíveis

## 🚨 Troubleshooting

### Problema: "Email não enviado"
**Solução:** Verificar credenciais e logs das Functions

### Problema: "Erro de autenticação"
**Solução:** Para Gmail, usar senha de app, não senha normal

### Problema: "Emails indo para spam"
**Solução:** Configurar SPF/DKIM no domínio

## 📈 Escalabilidade

- **Fila automática** para grandes volumes
- **Retry automático** em caso de falha
- **Monitoramento** via Firebase Console
- **Integração** com analytics

## 💡 Dicas

1. **Teste sempre** em desenvolvimento
2. **Use templates** para consistência
3. **Monitore logs** regularmente
4. **Configure alertas** para falhas
5. **Mantenha backups** das configurações

---

**Precisa de ajuda?** Consulte a documentação do Firebase ou entre em contato com o suporte.
