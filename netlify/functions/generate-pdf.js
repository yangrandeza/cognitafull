const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// Configuração específica para Netlify Functions
const isNetlify = process.env.NETLIFY || process.env.NETLIFY_LOCAL;

function generateStudentInsights(profile, student) {
  // Análise dinâmica baseada nos resultados dos testes
  const vark = profile.varkProfile?.dominant || 'Visual';
  const disc = profile.discProfile?.dominant || 'Dominância';
  const jung = profile.jungianProfile?.type || 'ENFP';
  const schwartz = profile.schwartzValues?.top_values || [];

  // Calcular idade e geração
  const birthYear = new Date().getFullYear() - student.age;
  const generation = getGeneration(birthYear);

  // Análise baseada nos estilos de aprendizagem
  const learningStyle = analyzeLearningStyle(vark, disc, jung);
  const communicationStyle = analyzeCommunicationStyle(disc, jung);
  const motivationStyle = analyzeMotivationStyle(schwartz, disc);
  const feedbackStyle = analyzeFeedbackStyle(jung, disc);

  return {
    mind: generateMindInsight(generation, learningStyle, communicationStyle),
    superpowers: generateSuperpowersInsight(vark, disc, jung),
    motivation: generateMotivationInsight(motivationStyle, schwartz),
    manual: generateManualInsight(feedbackStyle, disc, jung),
    tips: generatePersonalizedTips(vark, disc, jung, generation)
  };
}

function getGeneration(birthYear) {
  if (birthYear >= 2013) return 'Alpha';
  if (birthYear >= 1997) return 'Z';
  if (birthYear >= 1981) return 'Millennial';
  if (birthYear >= 1965) return 'X';
  if (birthYear >= 1946) return 'Boomer';
  return 'Silent';
}

function analyzeLearningStyle(vark, disc, jung) {
  const styles = [];

  // Análise VARK
  if (vark === 'Visual') styles.push('visual');
  if (vark === 'Auditivo') styles.push('auditory');
  if (vark === 'Leitura/Escrita') styles.push('reading');
  if (vark === 'Cinestésico') styles.push('kinesthetic');

  // Análise DISC para preferências de ambiente
  if (disc === 'Influência') styles.push('social');
  if (disc === 'Estabilidade') styles.push('structured');
  if (disc === 'Dominância') styles.push('independent');

  // Análise Jung para processamento
  if (jung.includes('N')) styles.push('abstract');
  if (jung.includes('S')) styles.push('concrete');

  return styles;
}

function analyzeCommunicationStyle(disc, jung) {
  if (disc === 'Influência' && jung.includes('F')) return 'relational';
  if (disc === 'Consciência' && jung.includes('T')) return 'objective';
  if (disc === 'Dominância') return 'direct';
  return 'balanced';
}

function analyzeMotivationStyle(schwartz, disc) {
  const hasAchievement = schwartz.includes('Realização');
  const hasPower = schwartz.includes('Poder');
  const hasBenevolence = schwartz.includes('Benevolência');

  if (hasAchievement && disc === 'Dominância') return 'achievement';
  if (hasBenevolence && disc === 'Influência') return 'purpose';
  if (hasPower) return 'recognition';
  return 'stability';
}

function analyzeFeedbackStyle(jung, disc) {
  if (jung.includes('F') && disc === 'Influência') return 'empathetic';
  if (jung.includes('T') && disc === 'Consciência') return 'objective';
  return 'balanced';
}

function generateMindInsight(generation, learningStyles, communicationStyle) {
  let insight = '';

  // Geração
  if (generation === 'Z') {
    insight += 'Você é uma pessoa da Geração Z ';
  } else if (generation === 'Alpha') {
    insight += 'Você é uma pessoa da Geração Alpha ';
  } else if (generation === 'Millennial') {
    insight += 'Você é uma pessoa da Geração Millennial ';
  } else {
    insight += 'Você é uma pessoa ';
  }

  // Estilo de pensamento baseado nos testes
  if (learningStyles.includes('abstract') && communicationStyle === 'relational') {
    insight += 'que pensa de forma abstrata e relacional. ';
  } else if (learningStyles.includes('concrete') && communicationStyle === 'objective') {
    insight += 'que pensa de forma concreta e objetiva. ';
  } else {
    insight += 'que processa informações de forma única e pessoal. ';
  }

  // Estilo de aprendizagem
  if (learningStyles.includes('social')) {
    insight += 'Ambientes colaborativos e dinâmicos ajudam a clarear seus pensamentos através do diálogo com outros.';
  } else if (learningStyles.includes('independent')) {
    insight += 'Você prefere ambientes focados onde pode processar informações de forma independente.';
  } else {
    insight += 'Ambientes equilibrados entre colaboração e foco individual maximizam seu aprendizado.';
  }

  return insight;
}

function generateSuperpowersInsight(vark, disc, jung) {
  let superpower = '';

  // Baseado no VARK
  if (vark === 'Visual') {
    superpower += 'Sua superpotência é a visualização criativa. ';
  } else if (vark === 'Auditivo') {
    superpower += 'Sua superpotência é a comunicação verbal. ';
  } else if (vark === 'Leitura/Escrita') {
    superpower += 'Sua superpotência é a análise textual. ';
  } else {
    superpower += 'Sua superpotência é a aprendizagem prática. ';
  }

  // Baseado no DISC
  if (disc === 'Influência') {
    superpower += 'Você é excelente em inspirar pessoas e criar ambientes positivos.';
  } else if (disc === 'Dominância') {
    superpower += 'Você é excelente em liderar iniciativas e tomar decisões.';
  } else if (disc === 'Consciência') {
    superpower += 'Você é excelente em organizar informações e manter a qualidade.';
  } else {
    superpower += 'Você é excelente em manter a harmonia e apoiar o grupo.';
  }

  return superpower;
}

function generateMotivationInsight(motivationStyle, schwartz) {
  let motivation = '';

  if (motivationStyle === 'achievement') {
    motivation += 'Você é movido(a) principalmente pelo sucesso e realização pessoal. ';
  } else if (motivationStyle === 'purpose') {
    motivation += 'Você é movido(a) principalmente por propósito e impacto positivo. ';
  } else if (motivationStyle === 'recognition') {
    motivation += 'Você é movido(a) principalmente pelo reconhecimento e influência. ';
  } else {
    motivation += 'Você é movido(a) principalmente pela estabilidade e segurança. ';
  }

  // Adicionar valores específicos
  if (schwartz.length > 0) {
    motivation += `Seus valores principais incluem ${schwartz.slice(0, 2).join(' e ')}, `;
    motivation += 'o que guia suas decisões e motivações diárias.';
  }

  return motivation;
}

function generateManualInsight(feedbackStyle, disc, jung) {
  let manual = '';

  // Estilo de feedback
  if (feedbackStyle === 'empathetic') {
    manual += 'Para feedback, você prefere recebê-lo de forma privada e empática, com foco no desenvolvimento pessoal. ';
  } else if (feedbackStyle === 'objective') {
    manual += 'Para feedback, você prefere informações objetivas e baseadas em fatos, com foco na melhoria técnica. ';
  } else {
    manual += 'Para feedback, você aprecia uma abordagem equilibrada entre empatia e objetividade. ';
  }

  // Estilo de tarefas baseado no DISC
  if (disc === 'Consciência') {
    manual += 'Para tarefas, você se sai melhor com instruções detalhadas e prazos claros. ';
  } else if (disc === 'Influência') {
    manual += 'Para tarefas, você se sai melhor em ambientes colaborativos e criativos. ';
  } else if (disc === 'Dominância') {
    manual += 'Para tarefas, você prefere autonomia e responsabilidade clara. ';
  } else {
    manual += 'Para tarefas, você aprecia estrutura com flexibilidade para adaptação. ';
  }

  // Participação baseada no Jung
  if (jung.includes('E')) {
    manual += 'Você gosta de participar ativamente de discussões e compartilhamento de ideias.';
  } else {
    manual += 'Você prefere processar informações internamente antes de compartilhar suas ideias.';
  }

  return manual;
}

function generatePersonalizedTips(vark, disc, jung, generation) {
  const tips = [];

  // Tips baseados no VARK
  if (vark === 'Visual') {
    tips.push('Use mapas mentais, diagramas e visualizações para organizar suas ideias e conceitos.');
    tips.push('Crie apresentações visuais e use cores para destacar informações importantes.');
  } else if (vark === 'Auditivo') {
    tips.push('Grave suas ideias em áudio e ouça palestras ou podcasts relacionados ao assunto.');
    tips.push('Discuta conceitos em voz alta ou explique para outras pessoas para fixar o aprendizado.');
  } else if (vark === 'Leitura/Escrita') {
    tips.push('Tome notas detalhadas e crie resumos escritos dos conceitos aprendidos.');
    tips.push('Use livros, artigos e documentação escrita como principais fontes de estudo.');
  } else {
    tips.push('Aprenda através da prática: construa, manipule objetos ou simule situações reais.');
    tips.push('Use exercícios físicos ou atividades práticas para reforçar conceitos teóricos.');
  }

  // Tips baseados no DISC
  if (disc === 'Influência') {
    tips.push('Trabalhe em equipe e participe de sessões de brainstorming para maximizar sua criatividade.');
    tips.push('Busque oportunidades de apresentar ideias e liderar discussões em grupo.');
  } else if (disc === 'Dominância') {
    tips.push('Assuma posições de liderança em projetos e tome decisões de forma independente.');
    tips.push('Defina metas claras e trabalhe de forma autônoma para alcançar resultados.');
  } else if (disc === 'Consciência') {
    tips.push('Crie listas de tarefas detalhadas e siga processos organizados para garantir qualidade.');
    tips.push('Dedique tempo para análise cuidadosa antes de tomar decisões importantes.');
  } else {
    tips.push('Foque em manter a harmonia do grupo enquanto contribui com seu conhecimento.');
    tips.push('Use sua paciência para ajudar outros membros da equipe quando necessário.');
  }

  // Tips baseados na geração
  if (generation === 'Z' || generation === 'Alpha') {
    tips.push('Incorpore tecnologia digital em seus métodos de estudo e comunicação.');
    tips.push('Use redes sociais e plataformas online para conectar-se com pares e mentores.');
  } else if (generation === 'Millennial') {
    tips.push('Equilibre o uso de tecnologia com métodos tradicionais de aprendizado.');
    tips.push('Busque mentoria e oportunidades de desenvolvimento profissional contínuo.');
  }

  // Tips baseados no Jung
  if (jung.includes('N')) {
    tips.push('Explore conexões entre conceitos e pense em aplicações práticas de ideias abstratas.');
  } else {
    tips.push('Concentre-se em fatos concretos e exemplos práticos para construir seu conhecimento.');
  }

  return tips.slice(0, 5); // Retorna apenas os 5 primeiros tips
}

function createHTMLTemplate(student, profile, insights) {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Dados do aluno
  const studentName = student.name;
  const studentAge = `${student.age} anos`;
  const studentGender = student.gender || 'Não informado';
  const completionDate = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString('pt-BR')
    : 'N/A';

  // Resultados dos testes
  const varkResult = profile.varkProfile?.dominant || 'Não determinado';
  const discResult = profile.discProfile?.dominant || 'Não determinado';
  const jungResult = profile.jungianProfile?.type || 'Não determinado';
  const schwartzValues = profile.schwartzValues?.top_values;
  const schwartzResult = schwartzValues && schwartzValues.length > 0
    ? schwartzValues.slice(0, 2).join(', ')
    : 'Não determinado';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Perfil de Aprendizagem - ${studentName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
          color: #1f2937;
          line-height: 1.6;
        }

        .header {
          background: linear-gradient(135deg, #ec9b2a 0%, #884cff 100%);
          padding: 40px 30px;
          text-align: center;
          border-radius: 20px;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }

        .logo {
          position: relative;
          z-index: 2;
          font-size: 48px;
          font-weight: 700;
          color: white;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          letter-spacing: 3px;
        }

        .subtitle {
          position: relative;
          z-index: 2;
          font-size: 20px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 400;
        }

        .date {
          position: absolute;
          top: 30px;
          right: 30px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          font-weight: 500;
        }

        .section {
          background: white;
          border-radius: 16px;
          padding: 30px;
          margin-bottom: 25px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #f3f4f6;
        }

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #ec9b2a, #884cff);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .table th {
          background: linear-gradient(135deg, #ec9b2a, #884cff);
          color: white;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          font-size: 14px;
        }

        .table tr:nth-child(even) {
          background: #f8fafc;
        }

        .insight-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
          border-left: 4px solid #884cff;
        }

        .insight-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .insight-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ec9b2a, #884cff);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }

        .insight-text {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin: 20px 0;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border-left: 4px solid #ec9b2a;
        }

        .tip-number {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #ec9b2a, #884cff);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        .tip-text {
          font-size: 15px;
          line-height: 1.6;
          color: #4b5563;
          margin-top: 2px;
        }

        .buttons-section {
          text-align: center;
          margin: 30px 0;
        }

        .buttons-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .buttons-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .button {
          background: linear-gradient(135deg, #ec9b2a, #884cff);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          display: block;
          transition: transform 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }

        .footer {
          margin-top: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }

        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .footer-tagline {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 12px;
          color: #9ca3af;
        }

        @media print {
          body {
            padding: 0;
          }
          .header {
            margin-bottom: 20px;
          }
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo">MUDEAI</div>
        <div class="subtitle">Relatório de Perfil de Aprendizagem</div>
        <div class="date">Gerado em: ${currentDate}</div>
      </div>

      <!-- Student Information -->
      <div class="section">
        <div class="section-title">
          <div class="section-icon">👤</div>
          Informações do Aluno
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Nome</strong></td>
              <td>${studentName}</td>
            </tr>
            <tr>
              <td><strong>Idade</strong></td>
              <td>${studentAge}</td>
            </tr>
            <tr>
              <td><strong>Gênero</strong></td>
              <td>${studentGender}</td>
            </tr>
            <tr>
              <td><strong>Data da Avaliação</strong></td>
              <td>${completionDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Test Results -->
      <div class="section">
        <div class="section-title">
          <div class="section-icon">📊</div>
          Seu Perfil de Aprendizagem
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Teste Psicométrico</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Estilo VARK</strong></td>
              <td style="color: #ec9b2a; font-weight: 600;">${varkResult}</td>
            </tr>
            <tr>
              <td><strong>Perfil DISC</strong></td>
              <td style="color: #ec9b2a; font-weight: 600;">${discResult}</td>
            </tr>
            <tr>
              <td><strong>Tipo Jung</strong></td>
              <td style="color: #ec9b2a; font-weight: 600;">${jungResult}</td>
            </tr>
            <tr>
              <td><strong>Valores Schwartz</strong></td>
              <td style="color: #ec9b2a; font-weight: 600;">${schwartzResult}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Insights -->
      <div class="section">
        <div class="section-title">
          <div class="section-icon">💡</div>
          Seus Insights Personalizados
        </div>

        <div class="insight-card">
          <div class="insight-title">
            <div class="insight-icon">🧠</div>
            Minha Mente em Foco
          </div>
          <div class="insight-text">${insights.mind}</div>
        </div>

        <div class="insight-card">
          <div class="insight-title">
            <div class="insight-icon">🚀</div>
            Meus Superpoderes
          </div>
          <div class="insight-text">${insights.superpowers}</div>
        </div>

        <div class="insight-card">
          <div class="insight-title">
            <div class="insight-icon">❤️</div>
            O Que Me Move
          </div>
          <div class="insight-text">${insights.motivation}</div>
        </div>

        <div class="insight-card">
          <div class="insight-title">
            <div class="insight-icon">📖</div>
            Meu Manual de Instruções
          </div>
          <div class="insight-text">${insights.manual}</div>
        </div>
      </div>

      <!-- Tips -->
      <div class="section">
        <div class="section-title">
          <div class="section-icon">🎯</div>
          Dicas para Voar Mais Alto
        </div>

        <div class="tips-grid">
          ${insights.tips.map((tip, index) => `
            <div class="tip-item">
              <div class="tip-number">${index + 1}</div>
              <div class="tip-text">${tip}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Buttons Section -->
      <div class="section">
        <div class="buttons-section">
          <div class="buttons-title">Compartilhe Seu Perfil!</div>
          <p style="color: #6b7280; margin-bottom: 30px; font-size: 14px;">
            Este relatório contém uma análise completa do seu perfil de aprendizagem baseada em metodologias científicas reconhecidas internacionalmente.
          </p>

          <div class="buttons-grid">
            <a href="https://ai.mudeeducacao.com.br" class="button">
              🌐 Plataforma MUDEAI
            </a>
            <a href="https://wa.me/5511999999999" class="button">
              💬 WhatsApp
            </a>
            <a href="mailto:contato@mudeeducacao.com.br" class="button">
              📧 Email
            </a>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-logo">MUDEAI</div>
        <div class="footer-tagline">DHO de empresas e gestor escolar solicitem demonstração de toda a ferramenta para conhecer todo o seu potencial.</div>
        <div class="footer-links">
          <span>Visite: https://ai.mudeeducacao.com.br</span>
          <span>Contato: contato@mudeeducacao.com.br</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

exports.handler = async (event, context) => {
  console.log('PDF generation started for Netlify function');

  // Apenas aceitar POST
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Parsing request body...');
    const { student, profile } = JSON.parse(event.body);

    if (!student || !profile) {
      console.error('Missing student or profile data');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados do aluno ou perfil não fornecidos' })
      };
    }

    console.log('Generating insights...');
    const insights = generateStudentInsights(profile, student);

    console.log('Creating HTML template...');
    const htmlContent = createHTMLTemplate(student, profile, insights);

    console.log('Launching Puppeteer browser...');
    // Configurar Puppeteer para Netlify Functions com configuração otimizada
    const browser = await puppeteer.launch({
      args: isNetlify ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-first-run',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-dev-tools',
        '--single-process',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ] : chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      ignoreHTTPSErrors: true,
      timeout: 60000, // 60 seconds timeout
    });

    try {
      console.log('Creating new page...');
      const page = await browser.newPage();

      // Configurar viewport para melhor qualidade
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
      });

      console.log('Setting page content...');
      await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 30000 });

      console.log('Generating PDF...');
      // Gerar PDF com configurações otimizadas para Netlify
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        tagged: true,
        outline: true,
        timeout: 30000
      });

      console.log('PDF generated successfully, size:', pdfBuffer.length);

      // Retornar PDF como base64
      const pdfBase64 = pdfBuffer.toString('base64');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="relatorio-${student.name.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: pdfBase64,
        isBase64Encoded: true
      };

    } finally {
      console.log('Closing browser...');
      await browser.close();
    }

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Erro ao gerar PDF',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
