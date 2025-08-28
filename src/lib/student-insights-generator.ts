import type { UnifiedProfile, DiscProfile, VarkProfile, Student } from "./types";

export type IndividualStudentInsights = {
    mind: string;
    superpowers: string;
    motivation: string;
    manual: string;
    tips: string[];
};

function getGeneration(birthYear: number) {
    if (birthYear >= 2013) return 'Geração Alpha';
    if (birthYear >= 1997) return 'Geração Z';
    if (birthYear >= 1981) return 'Millennial';
    if (birthYear >= 1965) return 'Geração X';
    if (birthYear >= 1946) return 'Boomer';
    return 'Silent';
}

export function generateStudentInsights(profile: UnifiedProfile, student: Student): IndividualStudentInsights {
    return {
        mind: generateMindInsight(profile, student),
        superpowers: generateSuperpowersInsight(profile),
        motivation: generateMotivationInsight(profile),
        manual: generateManualInsight(profile),
        tips: generateTips(profile),
    };
}

function generateMindInsight(profile: UnifiedProfile, student: Student): string {
    const { jungianProfile, discProfile } = profile;
    const isIntrovert = jungianProfile.includes('I');
    const isHighC = discProfile.dominant === 'Consciência';
    const isHighS = discProfile.dominant === 'Estabilidade';
    const birthYear = new Date().getFullYear() - student.age;
    const generation = getGeneration(birthYear);

    let text = `Eu faço parte da ${generation}. `;

    if (isIntrovert) {
        text += "Preciso de um momento de silêncio para organizar minhas ideias antes de compartilhar. ";
    } else {
        text += "Penso melhor em voz alta, trocando ideias com os outros. O diálogo me ajuda a clarear meus pensamentos. ";
    }

    if (isHighC || isHighS) {
        text += "Ambientes calmos e a possibilidade de trabalhar sozinho(a) no início de uma tarefa me ajudam a dar o meu melhor."
    } else {
        text += "Ambientes dinâmicos e com bastante estímulo me mantêm engajado(a) e produtivo(a)."
    }
    
    return text;
}

function generateSuperpowersInsight(profile: UnifiedProfile): string {
    const { jungianProfile, discProfile } = profile;
    
    if (discProfile.dominant === 'Dominância') {
        return "Minha força é tomar a frente, tomar decisões rápidas e focar nos resultados. Sou ótimo(a) em transformar planos em ação e superar desafios.";
    }
    if (discProfile.dominant === 'Influência') {
        return "Meu superpoder é a comunicação. Sou excelente em inspirar pessoas, apresentar novas ideias e criar um ambiente positivo e otimista.";
    }
     if (discProfile.dominant === 'Estabilidade') {
        return "Sou especialista em criar harmonia e dar apoio. Minha paciência e lealdade fazem de mim um(a) ótimo(a) colega de equipe, capaz de acalmar os ânimos e garantir que todos sejam ouvidos.";
    }
     if (discProfile.dominant === 'Consciência') {
        return "Minha força é pegar uma grande ideia e transformá-la em um plano de ação claro e organizado. Sou ótimo(a) em encontrar falhas, garantir a qualidade e cumprir prazos.";
    }

    return "Ainda estamos calculando seus superpoderes!"
}

function generateMotivationInsight(profile: UnifiedProfile): string {
    const topValues = profile.schwartzValues.top_values;
    
    const motivationMap: Record<string, string> = {
        'Autodireção': 'pela liberdade de criar e seguir minhas próprias ideias',
        'Estimulação': 'por novidades, desafios e uma vida com emoção',
        'Hedonismo': 'pelo prazer e por aproveitar os bons momentos',
        'Realização': 'por ser bem-sucedido(a) e mostrar minha capacidade',
        'Poder': 'por liderar, ter responsabilidade e influenciar',
        'Segurança': 'pela estabilidade e por um ambiente seguro e previsível',
        'Conformidade': 'por seguir as regras e atender às expectativas',
        'Tradição': 'por respeitar os costumes e a cultura que me cercam',
        'Benevolência': 'por ajudar as pessoas que amo e ser leal',
        'Universalismo': 'por lutar por justiça, igualdade e proteger o meio ambiente'
    }

    if (topValues.length >= 2) {
        return `Sou movido(a) principalmente ${motivationMap[topValues[0]]} e ${motivationMap[topValues[1]]}. Sentir que estou alinhado(a) com esses valores é o que me inspira a dar o meu melhor.`;
    }
    
    return "Ainda estamos descobrindo o que te move!"
}

function generateManualInsight(profile: UnifiedProfile): string {
    const { jungianProfile, discProfile } = profile;

    let feedback = "";
    let tasks = "";
    let participation = "";

    if (discProfile.dominant === 'Dominância' || discProfile.dominant === 'Consciência' || jungianProfile.includes('T')) {
        feedback = `Prefiro recebê-lo de forma direta, com fatos e exemplos específicos.`;
    } else {
        feedback = `Prefiro recebê-lo de forma privada, com foco no meu desenvolvimento e de maneira empática.`;
    }

    if (jungianProfile.includes('J') || discProfile.dominant === 'Consciência') {
        tasks = `Dê-me projetos com etapas e critérios de avaliação bem definidos.`;
    } else {
        tasks = `Dê-me a liberdade de explorar diferentes abordagens para resolver um problema.`;
    }

    if (jungianProfile.includes('I')) {
        participation = `Faça perguntas diretas para mim em pequenos grupos, em vez de me colocar no centro das atenções na sala inteira.`;
    } else {
        participation = `Chame-me para debates abertos e brainstorming em grupo. Adoro compartilhar minhas ideias!`;
    }
    
    return `**Feedback:** ${feedback}\n**Tarefas:** ${tasks}\n**Participação:** ${participation}`;
}

function generateTips(profile: UnifiedProfile): string[] {
    const tips = [];
    const { varkProfile, jungianProfile, discProfile } = profile;

    if (varkProfile.dominant === 'Visual') {
        tips.push("Use mapas mentais e cores em suas anotações para conectar ideias. Ao estudar, busque por vídeos e infográficos sobre o tema.");
    }
    if (varkProfile.dominant === 'Auditivo') {
        tips.push("Grave-se explicando a matéria em voz alta e ouça depois. Debater com colegas pode ser uma forma poderosa de fixar o conteúdo.");
    }
     if (varkProfile.dominant === 'Leitura/Escrita') {
        tips.push("Crie seus próprios resumos e questionários. Transformar gráficos e diagramas em texto corrido pode solidificar seu entendimento.");
    }
    if (varkProfile.dominant === 'Cinestésico') {
        tips.push("Sempre que possível, associe o aprendizado a uma ação. Crie modelos, faça experimentos ou simplesmente caminhe enquanto estuda.");
    }

    if (jungianProfile.includes('I') && (discProfile.dominant === 'Dominância' || discProfile.dominant === 'Influência')) {
        tips.push("Você tem um perfil socialmente ativo mas uma natureza introvertida. Lembre-se de reservar um tempo para 'recarregar as baterias' após interações intensas.");
    }

    if (jungianProfile.includes('P')) {
        tips.push("Sua flexibilidade é uma força, mas lembre-se de usar agendas ou aplicativos de tarefas para não perder os prazos importantes.");
    }

    if (tips.length === 0) {
        tips.push("Seu perfil é bastante equilibrado! Continue explorando diferentes formas de aprender para ver o que funciona melhor para cada assunto.");
    }

    return tips;
}
