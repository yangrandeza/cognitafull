import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

function generateStudentInsights(profile: any, student: any) {
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

function getGeneration(birthYear: number) {
  if (birthYear >= 2013) return 'Alpha';
  if (birthYear >= 1997) return 'Z';
  if (birthYear >= 1981) return 'Millennial';
  if (birthYear >= 1965) return 'X';
  if (birthYear >= 1946) return 'Boomer';
  return 'Silent';
}

function analyzeLearningStyle(vark: string, disc: string, jung: string) {
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

function analyzeCommunicationStyle(disc: string, jung: string) {
  if (disc === 'Influência' && jung.includes('F')) return 'relational';
  if (disc === 'Consciência' && jung.includes('T')) return 'objective';
  if (disc === 'Dominância') return 'direct';
  return 'balanced';
}

function analyzeMotivationStyle(schwartz: string[], disc: string) {
  const hasAchievement = schwartz.includes('Realização');
  const hasPower = schwartz.includes('Poder');
  const hasBenevolence = schwartz.includes('Benevolência');

  if (hasAchievement && disc === 'Dominância') return 'achievement';
  if (hasBenevolence && disc === 'Influência') return 'purpose';
  if (hasPower) return 'recognition';
  return 'stability';
}

function analyzeFeedbackStyle(jung: string, disc: string) {
  if (jung.includes('F') && disc === 'Influência') return 'empathetic';
  if (jung.includes('T') && disc === 'Consciência') return 'objective';
  return 'balanced';
}

function generateMindInsight(generation: string, learningStyles: string[], communicationStyle: string) {
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

function generateSuperpowersInsight(vark: string, disc: string, jung: string) {
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

function generateMotivationInsight(motivationStyle: string, schwartz: string[]) {
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

function generateManualInsight(feedbackStyle: string, disc: string, jung: string) {
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

function generatePersonalizedTips(vark: string, disc: string, jung: string, generation: string) {
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

export async function POST(request: NextRequest) {
  console.log('PDF generation started for Next.js API route - THIS IS THE NEXT.JS API ROUTE');
  try {
    const { student, profile } = await request.json();

    // Gerar insights
    const insights = generateStudentInsights(profile, student);

    // Criar documento PDF usando jsPDF com configurações otimizadas
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Função para adicionar texto com melhor formatação
    const addText = (text: string, options: any = {}) => {
      const {
        fontSize = 12,
        fontWeight = 'normal',
        maxWidth = contentWidth,
        align = 'left',
        color = [0, 0, 0],
        lineHeight = 1.4
      } = options;

      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);

      if (fontWeight === 'bold') {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      // Melhor quebra de linha para texto português
      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin;
        }

        let xPos = margin;
        if (align === 'center') {
          xPos = pageWidth / 2;
        } else if (align === 'right') {
          xPos = pageWidth - margin;
        }

        doc.text(line, xPos, yPosition, { align, maxWidth });
        yPosition += fontSize * 0.4 * lineHeight;
      });

      yPosition += 4; // Espaço extra após o parágrafo
    };

    // Função para adicionar tabela com bordas transparentes
    const addTable = (data: Array<{ label: string; value: string }>, title?: string) => {
      if (title) {
        addText(title, {
          fontSize: 16,
          fontWeight: 'bold',
          color: [236, 155, 42],
          lineHeight: 1.3
        });
        yPosition += 3;
      }

      const rowHeight = 12;
      const labelWidth = contentWidth * 0.35;
      const valueWidth = contentWidth * 0.65;

      data.forEach((row, index) => {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        // Fundo alternado suave
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252); // Cinza muito claro
          doc.rect(margin, yPosition - 3, contentWidth, rowHeight, 'F');
        }

        // Label (negrito)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55); // Cinza escuro
        const labelLines = doc.splitTextToSize(row.label, labelWidth);
        doc.text(labelLines, margin + 2, yPosition);

        // Value (normal)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(55, 65, 81); // Cinza médio
        const valueLines = doc.splitTextToSize(row.value, valueWidth);
        doc.text(valueLines, margin + labelWidth + 5, yPosition);

        // Linha separadora sutil
        doc.setDrawColor(229, 231, 235); // Cinza muito claro
        doc.setLineWidth(0.1);
        doc.line(margin, yPosition + rowHeight - 2, pageWidth - margin, yPosition + rowHeight - 2);

        yPosition += Math.max(labelLines.length, valueLines.length) * 5 + 3;
      });

      yPosition += 8; // Espaço após a tabela
    };

    // Função para adicionar seção com título e conteúdo
    const addSection = (title: string, content: string, icon?: string) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }

      // Título da seção com ícone
      const fullTitle = icon ? `${icon} ${title}` : title;
      addText(fullTitle, {
        fontSize: 18,
        fontWeight: 'bold',
        color: [236, 155, 42],
        lineHeight: 1.3
      });
      yPosition += 5;

      // Conteúdo
      addText(content, {
        fontSize: 11,
        lineHeight: 1.5,
        maxWidth: contentWidth - 5
      });

      yPosition += 10; // Espaço maior entre seções
    };

    // Header com gradiente visual melhorado
    doc.setFillColor(236, 155, 42);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Gradiente overlay
    doc.setFillColor(255, 255, 255);
    doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1 }));

    // Logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('MUDEAI', pageWidth / 2, 28, { align: 'center' });

    // Subtítulo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório de Perfil de Aprendizagem', pageWidth / 2, 38, { align: 'center' });

    // Data no canto superior direito
    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(10);
    doc.text(`Gerado em: ${currentDate}`, pageWidth - margin, 20, { align: 'right' });

    yPosition = 70;
    doc.setTextColor(0, 0, 0);

    // Informações do Aluno - usando tabela
    addTable([
      { label: 'Nome:', value: student.name },
      { label: 'Idade:', value: `${student.age} anos` },
      { label: 'Gênero:', value: student.gender || 'Não informado' },
      { label: 'Data da Avaliação:', value: student.createdAt ? new Date(student.createdAt).toLocaleDateString('pt-BR') : 'N/A' }
    ], 'INFORMAÇÕES DO ALUNO');

    // Perfil de Aprendizagem - usando tabela
    addTable([
      { label: 'Estilo VARK:', value: profile.varkProfile?.dominant || 'Não determinado' },
      { label: 'Perfil DISC:', value: profile.discProfile?.dominant || 'Não determinado' },
      { label: 'Tipo Jung:', value: profile.jungianProfile?.type || 'Não determinado' },
      { label: 'Valores Schwartz:', value: profile.schwartzValues?.top_values?.slice(0, 2).join(', ') || 'Não determinado' }
    ], 'SEU PERFIL DE APRENDIZAGEM');

    // Insights Personalizados
    addText('SEUS INSIGHTS PERSONALIZADOS', {
      fontSize: 18,
      fontWeight: 'bold',
      color: [236, 155, 42],
      align: 'center',
      lineHeight: 1.3
    });
    yPosition += 8;

    const insightSections = [
      { title: 'Minha Mente em Foco', content: insights.mind, icon: '🧠' },
      { title: 'Meus Superpoderes', content: insights.superpowers, icon: '🚀' },
      { title: 'O Que Me Move', content: insights.motivation, icon: '❤️' },
      { title: 'Meu Manual de Instruções', content: insights.manual, icon: '📖' }
    ];

    insightSections.forEach(section => {
      addSection(section.title, section.content, section.icon);
    });

    // Dicas - usando lista numerada melhorada
    addText('DICAS PARA VOAR MAIS ALTO', {
      fontSize: 18,
      fontWeight: 'bold',
      color: [236, 155, 42],
      align: 'center',
      lineHeight: 1.3
    });
    yPosition += 8;

    insights.tips.forEach((tip: string, index: number) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      // Número da dica em círculo
      doc.setFillColor(236, 155, 42);
      doc.circle(margin + 6, yPosition + 2, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text((index + 1).toString(), margin + 6, yPosition + 3, { align: 'center' });

      // Texto da dica
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const tipLines = doc.splitTextToSize(tip, contentWidth - 20);
      doc.text(tipLines, margin + 15, yPosition);

      yPosition += tipLines.length * 5 + 6;
    });

    // Footer melhorado
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    const footerY = pageHeight - 30;

    // Linha separadora
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

    // Texto do footer
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text('MUDEAI - Plataforma de Perfil de Aprendizagem', pageWidth / 2, footerY, { align: 'center' });
    doc.text('https://ai.mudeeducacao.com.br | contato@mudeeducacao.com.br', pageWidth / 2, footerY + 5, { align: 'center' });

    // Obter o PDF como buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Retornar o Buffer diretamente (Next.js lida com a conversão)
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-${student.name.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}
