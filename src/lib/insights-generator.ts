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


// --- NEW INSIGHTS GENERATION ---

function calculateCompassData(profiles: UnifiedProfile[]) {
    if (profiles.length === 0) return null;

    let rhythmStructure = 0; // North: +J, +C, +S | -P
    let socialInteraction = 0; // East: +E, +I | -I(jung), -S
    let energySource = 0;      // South: +Benevolence, +Universalism | -Power, -Achievement
    let contentAbsorption = 0; // West: +V, +K, +S(jung) | -A, -R, -N

    profiles.forEach(p => {
        // Rhythm & Structure
        if (p.jungianProfile.includes('J')) rhythmStructure++;
        if (p.jungianProfile.includes('P')) rhythmStructure--;
        if (p.discProfile.dominant === 'Consciência' || p.discProfile.dominant === 'Estabilidade') rhythmStructure++;

        // Social Interaction
        if (p.jungianProfile.includes('E')) socialInteraction++;
        if (p.jungianProfile.includes('I')) socialInteraction--;
        if (p.discProfile.dominant === 'Influência') socialInteraction++;
        if (p.discProfile.dominant === 'Estabilidade') socialInteraction--;
        
        // Energy Source
        if (p.schwartzValues.top_values.includes('Benevolência') || p.schwartzValues.top_values.includes('Universalismo')) energySource++;
        if (p.schwartzValues.top_values.includes('Poder') || p.schwartzValues.top_values.includes('Realização')) energySource--;

        // Content Absorption
        if (p.varkProfile.dominant === 'Visual' || p.varkProfile.dominant === 'Cinestésico') contentAbsorption++;
        if (p.varkProfile.dominant === 'Auditivo' || p.varkProfile.dominant === 'Leitura/Escrita') contentAbsorption--;
        if (p.jungianProfile.includes('S')) contentAbsorption++;
        if (p.jungianProfile.includes('N')) contentAbsorption--;
    });
    
    // Normalize scores to a 0-100 scale
    const normalize = (score: number) => Math.max(0, Math.min(100, 50 + (score / profiles.length) * 50));

    return [
        { axis: "Ritmo & Estrutura", value: normalize(rhythmStructure) },
        { axis: "Interação Social", value: normalize(socialInteraction) },
        { axis: "Fonte de Energia", value: normalize(energySource) },
        { axis: "Absorção de Conteúdo", value: normalize(contentAbsorption) },
    ];
}


function generateInsightCards(compassData: { axis: string; value: number }[] | null) {
    if (!compassData) return { climate: "", engagement: "", explanation: "" };

    const climate = {
        score: (compassData[0].value + compassData[1].value) / 2, // Rhythm & Social
        text: ""
    };
    const engagement = {
        score: compassData[2].value, // Energy
        text: ""
    };
    const explanation = {
        score: compassData[3].value, // Absorption
        text: ""
    };

    // O Clima da Sala
    if (compassData[1].value > 60) { // Social Interaction
        climate.text = `Esta é uma turma altamente colaborativa que se energiza em debates e projetos em grupo. Eles florescem quando podem interagir e construir juntos. `;
    } else if (compassData[1].value < 40) {
        climate.text = `Esta turma prefere a concentração individual. Eles produzem melhor quando têm seu próprio espaço e tempo para pensar antes de compartilhar. `;
    } else {
        climate.text = `Esta turma é equilibrada, adaptando-se bem tanto a trabalhos em grupo quanto a tarefas individuais. `;
    }
    if (compassData[0].value > 60) { // Rhythm
        climate.text += `Eles valorizam a clareza e a previsibilidade. Forneça roteiros claros e regras bem definidas para que se sintam seguros e focados.`
    } else {
        climate.text += `Eles apreciam a flexibilidade. Esteja aberto a desvios no plano de aula e a novas ideias que surgirem no momento.`
    }


    // A Faísca do Engajamento
    if (engagement.score > 60) { // Purpose & Harmony
        engagement.text = `O combustível desta turma é o propósito e a conexão. Apresente problemas que tenham um impacto real e mostre como o conhecimento ajuda a comunidade. Crie um ambiente de apoio mútuo.`
    } else { // Challenge & Achievement
        engagement.text = `A principal motivação é o desafio e a conquista. Defina metas claras, crie competições saudáveis e celebre as vitórias para manter a turma engajada.`
    }

    // A Melhor Forma de Explicar
    if (explanation.score > 60) { // Concrete & Practical
        explanation.text = `Aposte em uma abordagem concreta e prática. Comece com demonstrações, vídeos ou exemplos do mundo real. Depois, coloque-os para construir, criar ou resolver algo com as próprias mãos.`
    } else { // Abstract & Theoretical
        explanation.text = `Esta turma absorve bem conceitos abstratos. Use analogias, debates teóricos e textos ricos em informação. Eles gostam de entender o 'porquê' por trás das coisas.`
    }

    return {
        climate: climate.text,
        engagement: engagement.text,
        explanation: explanation.text,
    }
}


/**
 * Generates a textual summary of the class profile for the AI assistant.
 */
export function generateClassProfileSummary(profiles: UnifiedProfile[]): string {
    if (profiles.length === 0) {
        return "Não há dados de perfil suficientes para gerar um resumo da turma.";
    }

    const compassData = calculateCompassData(profiles);
    if (!compassData) {
         return "Não foi possível calcular o perfil da turma.";
    }
    const cardInsights = generateInsightCards(compassData);

    const compassSummary = compassData.map(d => {
        let tendency = "";
        if (d.value > 65) tendency = "uma forte tendência para";
        else if (d.value < 35) tendency = "uma baixa tendência para";
        else tendency = "uma tendência equilibrada para";

        let detail = "";
        if (d.axis === "Ritmo & Estrutura") detail = d.value > 50 ? "Metódica (prefere estrutura)" : "Adaptável (prefere flexibilidade)";
        if (d.axis === "Interação Social") detail = d.value > 50 ? "Colaborativa (prefere grupo)" : "Focada (prefere individual)";
        if (d.axis === "Fonte de Energia") detail = d.value > 50 ? "Propósito & Harmonia" : "Desafio & Conquista";
        if (d.axis === "Absorção de Conteúdo") detail = d.value > 50 ? "Concreta & Prática" : "Abstrata & Teórica";
        
        return `- ${d.axis} (${detail}): ${tendency} ${detail.split('(')[0].trim()}`;
    }).join('\n');
    
    return `Resumo do Mosaico de Aprendizagem da Turma:
A turma demonstra as seguintes características principais:
${compassSummary}

Com base nisso, aqui estão os insights pedagógicos:
- O Clima da Sala: ${cardInsights.climate}
- A Faísca do Engajamento: ${cardInsights.engagement}
- A Melhor Forma de Explicar: ${cardInsights.explanation}
`;
}


function generateCommunicationData(profiles: UnifiedProfile[]) {
    if (profiles.length === 0) return null;

    let relationalScore = 0; // +F, +I
    let objectiveScore = 0; // +T, +C

    profiles.forEach(p => {
        if (p.jungianProfile.includes('F')) relationalScore++;
        if (p.discProfile.dominant === 'Influência') relationalScore++;
        
        if (p.jungianProfile.includes('T')) objectiveScore++;
        if (p.discProfile.dominant === 'Consciência') objectiveScore++;
    });

    const isRelational = relationalScore >= objectiveScore;
    
    return {
        style: isRelational ? 'Relacional' : 'Objetivo',
        feedback: isRelational ? 'Empático' : 'Direto',
        recommendation: isRelational
            ? 'A turma responde melhor a uma comunicação que considera os sentimentos e o contexto pessoal. Use storytelling e mostre empatia ao dar feedback.'
            : 'Foque em fatos, lógica e clareza. Feedbacks devem ser diretos, específicos e baseados em dados, sem rodeios.'
    };
}


function generateWorkPaceData(profiles: UnifiedProfile[]) {
    if (profiles.length === 0) return null;

    let fastPaceScore = 0; // +D, +I
    let consideredPaceScore = 0; // +S, +C
    let bigPictureScore = 0; // +N
    let detailScore = 0; // +S (jung)

    profiles.forEach(p => {
        if (p.discProfile.dominant === 'Dominância' || p.discProfile.dominant === 'Influência') fastPaceScore++;
        if (p.discProfile.dominant === 'Estabilidade' || p.discProfile.dominant === 'Consciência') consideredPaceScore++;

        if (p.jungianProfile.includes('N')) bigPictureScore++;
        if (p.jungianProfile.includes('S')) detailScore++;
    });
    
    const isFast = fastPaceScore >= consideredPaceScore;
    const isBigPicture = bigPictureScore > detailScore;

    return {
        pace: isFast ? 'Rápido' : 'Cadenciado',
        focus: isBigPicture ? 'Visão Geral' : 'Detalhes',
        recommendation: isFast
            ? `A turma tem um ritmo acelerado e gosta de ver as coisas acontecendo. Defina metas curtas e mantenha a energia alta. ${isBigPicture ? 'Eles preferem focar no objetivo final a se perder em detalhes.' : 'Apesar da rapidez, eles não perdem a atenção aos detalhes importantes.'}`
            : `Este grupo prefere um ritmo mais calmo e planejado. Dê tempo para que processem a informação. ${isBigPicture ? 'Eles precisam entender o "porquê" antes de mergulhar nos detalhes.' : 'São meticulosos e valorizam um trabalho bem feito e detalhado.'}`
    }
}



// --- Public API for the dashboard ---
export function getDashboardData(profiles: RawUnifiedProfile[], students: Student[]) {
    const processedProfiles = processProfiles(profiles);
    const compassData = calculateCompassData(processedProfiles);
    const insightCards = generateInsightCards(compassData);
    const classProfileSummary = generateClassProfileSummary(processedProfiles);
    const dissonanceData = generateDissonanceData(processedProfiles, students);
    const teamsData = generateTeamData(processedProfiles, students);
    const communicationData = generateCommunicationData(processedProfiles);
    const workPaceData = generateWorkPaceData(processedProfiles);

    return {
        compassData,
        insightCards,
        classProfileSummary,
        dissonanceData,
        teamsData,
        communicationData,
        workPaceData,
    };
}


// --- Legacy Data Generation Functions (can be phased out) ---
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


function getGeneration(birthYear: number) {
    if (birthYear >= 2013) return 'Alpha';
    if (birthYear >= 1997) return 'Gen Z';
    if (birthYear >= 1981) return 'Millennial';
    if (birthYear >= 1965) return 'Gen X';
    if (birthYear >= 1946) return 'Boomer';
    return 'Silent';
}

export function getDemographicsData(students: Student[]) {
    if (students.length === 0) {
        return null;
    }
    const currentYear = new Date().getFullYear();

    const totalAge = students.reduce((sum, s) => sum + s.age, 0);
    const averageAge = totalAge / students.length;

    const genderCounts = students.reduce((acc, s) => {
        const gender = s.gender || 'Não informado';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const dominantGender = Object.keys(genderCounts).reduce((a, b) => genderCounts[a] > genderCounts[b] ? a : b, 'N/A');

    const generationCounts = students.reduce((acc, s) => {
        const birthYear = currentYear - s.age;
        const generation = getGeneration(birthYear);
        acc[generation] = (acc[generation] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const dominantGeneration = Object.keys(generationCounts).reduce((a, b) => generationCounts[a] > generationCounts[b] ? a : b, 'N/A');

    return {
        averageAge,
        dominantGender,
        dominantGeneration,
    };
}
