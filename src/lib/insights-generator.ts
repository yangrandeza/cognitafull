import type { UnifiedProfile, Student, QuizAnswers, VarkProfile, DiscProfile, RawUnifiedProfile } from "./types";

/**
 * Main processing function to convert raw profiles into fully typed profiles.
 * This simulates the work of a backend cloud function.
 */
export function processProfiles(rawProfiles: RawUnifiedProfile[]): UnifiedProfile[] {
  return rawProfiles.map(rawProfile => {
    const { rawAnswers, ...rest } = rawProfile;
    // This check is to avoid reprocessing profiles that might already be processed
    if ('varkProfile' in rest && (rest as any).varkProfile) {
        return rest as UnifiedProfile;
    }
    
    const varkProfile = calculateVark(rawAnswers);
    const discProfile = calculateDisc(rawAnswers);
    const jungianProfile = calculateJungian(rawAnswers);
    const schwartzValues = calculateSchwartz(rawAnswers);

    // Dissonance analysis
    const {dissonanceAlert, dissonanceNotes} = analyzeDissonance(discProfile, jungianProfile);


    return {
      ...rest,
      varkProfile,
      discProfile,
      jungianProfile,
      schwartzValues,
      dissonanceAlert,
      dissonanceNotes,
    };
  });
}

// --- Individual Profile Calculation Functions ---

function calculateVark(answers: QuizAnswers): VarkProfile {
    const scores = { v: 0, a: 0, r: 0, k: 0 };
    const varkQuestions = ['vark_1', 'vark_2', 'vark_3', 'vark_4'];
    varkQuestions.forEach(id => {
        const answer = answers[id];
        if (answer === 'V') scores.v++;
        if (answer === 'A') scores.a++;
        if (answer === 'R') scores.r++;
        if (answer === 'K') scores.k++;
    });

    const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    let dominantLabel: VarkProfile['dominant'] = 'Multimodal';
    if (dominant === 'v') dominantLabel = 'Visual';
    if (dominant === 'a') dominantLabel = 'Auditivo';
    if (dominant === 'r') dominantLabel = 'Leitura/Escrita';
    if (dominant === 'k') dominantLabel = 'Cinestésico';
    
    return { dominant: dominantLabel, scores };
}

function calculateDisc(answers: QuizAnswers): DiscProfile {
    // Simplified DISC calculation based on word choices
    const scores = { d: 0, i: 0, s: 0, c: 0 };
    const wordMap = {
        'Decidido': 'd', 'Competitivo': 'd', 'Direto': 'd', 'Ousado': 'd', 'Focado em resultados': 'd', 'Exigente': 'd', 'Pioneiro': 'd', 'Independente': 'd',
        'Influente': 'i', 'Otimista': 'i', 'Sociável': 'i', 'Entusiasmado': 'i', 'Inspirador': 'i', 'Comunicativo': 'i', 'Convincente': 'i', 'Divertido': 'i',
        'Paciente': 's', 'Estável': 's', 'Previsível': 's', 'Calmo': 's', 'Apoiador': 's', 'Consistente': 's', 'Leal': 's', 'Harmonioso': 's',
        'Detalhado': 'c', 'Cauteloso': 'c', 'Perfeccionista': 'c', 'Sistemático': 'c', 'Lógico': 'c', 'Preciso': 'c', 'Cuidadoso': 'c', 'Organizado': 'c',
    };

    for (let q = 1; q <= 8; q++) {
        const mostKey = `disc_${q}_most`;
        const leastKey = `disc_${q}_least`;
        const mostWord = answers[mostKey];
        const leastWord = answers[leastKey];

        if (mostWord && wordMap[mostWord]) {
            scores[wordMap[mostWord]]++;
        }
        if (leastWord && wordMap[leastWord]) {
            scores[wordMap[leastWord]]--;
        }
    }

    const dominantKey = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    let dominantLabel: DiscProfile['dominant'] = 'Influência'; // Default
    if (dominantKey === 'd') dominantLabel = 'Dominância';
    if (dominantKey === 'i') dominantLabel = 'Influência';
    if (dominantKey === 's') dominantLabel = 'Estabilidade';
    if (dominantKey === 'c') dominantLabel = 'Consciência';

    return { dominant: dominantLabel, scores };
}

function calculateJungian(answers: QuizAnswers): string {
    let profile = '';
    profile += answers['jung_1'] === 'I' ? 'I' : 'E';
    profile += answers['jung_2'] === 'S' ? 'S' : 'N';
    profile += answers['jung_3'] === 'T' ? 'T' : 'F';
    profile += answers['jung_4'] === 'J' ? 'J' : 'P';
    return profile;
}

function calculateSchwartz(answers: QuizAnswers): { top_values: string[], scores: Record<string, number> } {
    const scores: Record<string, number> = {};
    const valueMap = {
        'schwartz_1': 'Autodireção',
        'schwartz_2': 'Estimulação',
        'schwartz_3': 'Hedonismo',
        'schwartz_4': 'Realização',
        'schwartz_5': 'Poder',
        'schwartz_6': 'Segurança',
        'schwartz_7': 'Conformidade',
        'schwartz_8': 'Tradição',
        'schwartz_9': 'Benevolência',
        'schwartz_10': 'Universalismo',
    };

    Object.keys(valueMap).forEach(key => {
        if(answers[key]) {
            scores[valueMap[key]] = parseInt(answers[key], 10);
        }
    });

    const top_values = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([key]) => key);

    return { top_values, scores };
}

function analyzeDissonance(discProfile: DiscProfile, jungianProfile: string): {dissonanceAlert: boolean, dissonanceNotes: string} {
    const isIntrovert = jungianProfile.startsWith('I');
    const isHighInfluence = discProfile.dominant === 'Influência';
    const isHighDominance = discProfile.dominant === 'Dominância';

    if (isIntrovert && (isHighInfluence || isHighDominance)) {
        return {
            dissonanceAlert: true,
            dissonanceNotes: `Perfil naturalmente introvertido (${jungianProfile}) com um comportamento de alta exposição social (${discProfile.dominant}). Isso pode levar a um alto consumo de energia em interações sociais.`
        }
    }
    
    return {
        dissonanceAlert: false,
        dissonanceNotes: ""
    };
}


// --- Data Generation Functions for Charts ---

/**
 * Aggregates VARK profile data for chart visualization.
 */
export function generateVarkData(profiles: UnifiedProfile[]) {
  const varkCounts: Record<string, number> = { 'Visual': 0, 'Auditivo': 0, "Leitura/Escrita": 0, 'Cinestésico': 0, 'Multimodal': 0 };
  
  profiles.forEach(p => {
    if (p?.varkProfile?.dominant) {
      const dominantProfile = p.varkProfile.dominant;
      if(varkCounts[dominantProfile] !== undefined) {
         varkCounts[dominantProfile]++;
      }
    }
  });

  return [
    { type: 'Visual', value: varkCounts.Visual, fill: 'var(--chart-1)' },
    { type: 'Auditivo', value: varkCounts.Auditivo, fill: 'var(--chart-2)' },
    { type: 'Leitura/Escrita', value: varkCounts["Leitura/Escrita"], fill: 'var(--chart-3)' },
    { type: 'Cinestésico', value: varkCounts.Cinestésico, fill: 'var(--chart-4)' },
  ].filter(item => item.value > 0);
}

/**
 * Formats DISC profile data for the scatter chart.
 */
export function generateDiscData(profiles: UnifiedProfile[]) {
    return profiles.map(p => ({
      name: p.id, // Should map to student name later
      d: p.discProfile.scores.d,
      i: p.discProfile.scores.i,
      s: p.discProfile.scores.s,
      c: p.discProfile.scores.c,
    }));
}

/**
 * Aggregates Schwartz values data.
 */
export function generateSchwartzData(profiles: UnifiedProfile[]) {
    const valueCounts = new Map<string, number>();
    profiles.forEach(p => {
        p.schwartzValues.top_values.forEach(value => {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        });
    });

    return Array.from(valueCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Show top 5 dominant values for clarity
}

/**
 * Filters for students with dissonance alerts.
 */
export function generateDissonanceData(profiles: UnifiedProfile[], students: Student[]) {
    return profiles
        .filter(p => p.dissonanceAlert && p.dissonanceNotes)
        .map(p => {
            const student = students.find(s => s.id === p.studentId);
            return {
                studentName: student?.name || 'Aluno desconhecido',
                note: p.dissonanceNotes!,
            };
        });
}

/**
 * Generates suggested teams based on profiles.
 */
export function generateTeamData(profiles: UnifiedProfile[], students: Student[]) {
    const leaders = profiles.filter(p => p.discProfile.dominant === 'Dominância' || p.jungianProfile.includes('TJ'));
    const communicators = profiles.filter(p => p.discProfile.dominant === 'Influência' || p.jungianProfile.includes('EF'));
    const planners = profiles.filter(p => p.discProfile.dominant === 'Consciência' || p.jungianProfile.includes('SJ'));
    const harmonizers = profiles.filter(p => p.discProfile.dominant === 'Estabilidade' || p.jungianProfile.includes('FP'));

    const getName = (profile: UnifiedProfile) => students.find(s => s.id === profile.studentId)?.name || 'Desconhecido';

    return [
        { category: 'Líderes e Inovadores', description: 'Bons para iniciar tarefas e tomar decisões.', students: leaders.map(getName).filter((v, i, a) => a.indexOf(v) === i) },
        { category: 'Comunicadores e Influenciadores', description: 'Ideais para apresentar ideias e engajar o grupo.', students: communicators.map(getName).filter((v, i, a) => a.indexOf(v) === i) },
        { category: 'Planejadores e Analistas', description: 'Ótimos para organizar o trabalho e focar nos detalhes.', students: planners.map(getName).filter((v, i, a) => a.indexOf(v) === i) },
        { category: 'Harmonizadores e Apoiadores', description: 'Essenciais para manter o time unido e motivado.', students: harmonizers.map(getName).filter((v, i, a) => a.indexOf(v) === i) },
    ].filter(team => team.students.length > 0);
}


/**
 * Generates a textual summary of the class profile for the AI assistant.
 */
export function generateClassProfileSummary(profiles: UnifiedProfile[]): string {
    if (profiles.length === 0) {
        return "Não há dados de perfil suficientes para gerar um resumo da turma. Peça aos seus alunos para preencherem o questionário.";
    }

    // VARK Distribution
    const varkCounts: Record<string, number> = { 'Visual': 0, 'Auditivo': 0, "Leitura/Escrita": 0, 'Cinestésico': 0, 'Multimodal': 0 };
    profiles.forEach(p => {
      if(p?.varkProfile?.dominant) {
        const dominantProfile = p.varkProfile.dominant;
        if(varkCounts[dominantProfile] !== undefined) {
            varkCounts[dominantProfile]++;
        }
      }
    });
    const totalVark = profiles.length;
    const varkSummary = Object.entries(varkCounts)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${type}: ${(count / totalVark * 100).toFixed(0)}%`)
        .join(', ');

    // DISC Dominance
    const discCounts: Record<string, number> = { 'Dominância': 0, 'Influência': 0, 'Estabilidade': 0, 'Consciência': 0 };
    profiles.forEach(p => {
      if (p?.discProfile?.dominant) {
        const dominantProfile = p.discProfile.dominant;
        if (discCounts[dominantProfile] !== undefined) {
            discCounts[dominantProfile]++;
        }
      }
    });
    const discSummary = Object.entries(discCounts)
        .filter(([, count]) => count > 0)
        .map(([type]) => type)
        .join(', ');
        
    // Schwartz Values
    const valueCounts = new Map<string, number>();
    profiles.forEach(p => {
        p?.schwartzValues?.top_values.forEach(value => {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        });
    });
    const topValues = Array.from(valueCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([value]) => value)
        .join(', ');

    return `Perfil Agregado da Turma:
- Estilos de Aprendizagem (VARK): ${varkSummary}.
- Perfis Comportamentais Dominantes (DISC): Alta concentração em ${discSummary}.
- Principais Valores Motivacionais (Schwartz): ${topValues}.
`;
}
