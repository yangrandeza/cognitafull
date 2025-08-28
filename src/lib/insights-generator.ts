import type { UnifiedProfile, Student, VarkProfile } from "./types";

/**
 * Aggregates VARK profile data for chart visualization.
 */
export function generateVarkData(profiles: UnifiedProfile[]) {
  const varkCounts = { Visual: 0, Auditory: 0, Reading: 0, Kinesthetic: 0, Multimodal: 0 };
  
  profiles.forEach(p => {
    if (p.varkProfile.dominant) {
      varkCounts[p.varkProfile.dominant]++;
    }
  });

  return [
    { type: 'Visual', value: varkCounts.Visual, fill: 'var(--chart-1)' },
    { type: 'Auditivo', value: varkCounts.Auditory, fill: 'var(--chart-2)' },
    { type: 'Leitura/Escrita', value: varkCounts.Reading, fill: 'var(--chart-3)' },
    { type: 'Cinestésico', value: varkCounts.Kinesthetic, fill: 'var(--chart-4)' },
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
        .sort((a, b) => b.count - a.count);
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
 * This is a simplistic implementation and can be greatly improved.
 */
export function generateTeamData(profiles: UnifiedProfile[], students: Student[]) {
    const leaders = profiles.filter(p => p.discProfile.dominant === 'Dominance');
    const communicators = profiles.filter(p => p.discProfile.dominant === 'Influence');
    const planners = profiles.filter(p => p.discProfile.dominant === 'Conscientiousness');
    const harmonizers = profiles.filter(p => p.discProfile.dominant === 'Steadiness');

    const getName = (profile: UnifiedProfile) => students.find(s => s.id === profile.studentId)?.name || 'Desconhecido';

    return [
        { category: 'Líderes e Inovadores', students: leaders.map(getName) },
        { category: 'Comunicadores e Influenciadores', students: communicators.map(getName) },
        { category: 'Planejadores e Analistas', students: planners.map(getName) },
        { category: 'Harmonizadores e Executores', students: harmonizers.map(getName) },
    ].filter(team => team.students.length > 0);
}


/**
 * Generates a textual summary of the class profile for the AI assistant.
 */
export function generateClassProfileSummary(profiles: UnifiedProfile[]): string {
    if (profiles.length === 0) {
        return "Não há dados de perfil suficientes para gerar um resumo da turma.";
    }

    // VARK Distribution
    const varkCounts = { Visual: 0, Auditory: 0, Reading: 0, Kinesthetic: 0, Multimodal: 0 };
    profiles.forEach(p => varkCounts[p.varkProfile.dominant]++);
    const totalVark = profiles.length;
    const varkSummary = Object.entries(varkCounts)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => `${type}: ${(count / totalVark * 100).toFixed(0)}%`)
        .join(', ');

    // DISC Dominance
    const discCounts = { Dominance: 0, Influence: 0, Steadiness: 0, Conscientiousness: 0 };
    profiles.forEach(p => discCounts[p.discProfile.dominant]++);
    const discSummary = Object.entries(discCounts)
        .filter(([, count]) => count > 0)
        .map(([type]) => type)
        .join(', ');
        
    // Schwartz Values
    const valueCounts = new Map<string, number>();
    profiles.forEach(p => {
        p.schwartzValues.top_values.forEach(value => {
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
