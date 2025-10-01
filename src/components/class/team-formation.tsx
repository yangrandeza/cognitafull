"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Shuffle, Settings, Eye, EyeOff } from "lucide-react";
import type { UnifiedProfile, Student } from "@/lib/types";

interface TeamFormationProps {
  students: Student[];
  profiles: UnifiedProfile[];
}

interface Team {
  id: string;
  name: string;
  members: {
    student: Student;
    profile: UnifiedProfile;
  }[];
  complementaryScore: number;
  explanation: string;
}

type GroupingCriteria = 'disc' | 'vark' | 'jungian' | 'mixed';
type SortOrder = 'best-first' | 'worst-first' | 'none';

export function TeamFormation({ students, profiles }: TeamFormationProps) {
  const [groupSize, setGroupSize] = useState<number>(4);
  const [groupingCriteria, setGroupingCriteria] = useState<GroupingCriteria>('mixed');
  const [teams, setTeams] = useState<Team[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('best-first');

  // Filter students with profiles
  const studentsWithProfiles = useMemo(() => {
    return students.filter(student =>
      profiles.some(profile => profile.studentId === student.id)
    ).map(student => ({
      student,
      profile: profiles.find(profile => profile.studentId === student.id)!
    }));
  }, [students, profiles]);

  // Calculate complementary score between two profiles
  const calculateComplementaryScore = (profile1: UnifiedProfile, profile2: UnifiedProfile): number => {
    let score = 0;

    // DISC complementarity
    const discPairs = {
      'Dominância': ['Estabilidade', 'Consciência'],
      'Influência': ['Consciência', 'Dominância'],
      'Estabilidade': ['Dominância', 'Influência'],
      'Consciência': ['Influência', 'Estabilidade']
    };

    if (discPairs[profile1.discProfile.dominant]?.includes(profile2.discProfile.dominant)) {
      score += 2;
    }

    // Jungian complementarity (opposites)
    const jungianOpposites: Record<string, string> = {
      'E': 'I', 'I': 'E',
      'S': 'N', 'N': 'S',
      'T': 'F', 'F': 'T',
      'J': 'P', 'P': 'J'
    };

    for (let i = 0; i < profile1.jungianProfile.type.length; i++) {
      const trait1 = profile1.jungianProfile.type[i];
      const trait2 = profile2.jungianProfile.type[i];
      if (jungianOpposites[trait1] === trait2) {
        score += 1;
      }
    }

    // VARK complementarity
    const varkComplements: Record<string, string[]> = {
      'Visual': ['Auditivo', 'Cinestésico'],
      'Auditivo': ['Visual', 'Leitura/Escrita'],
      'Leitura/Escrita': ['Auditivo', 'Cinestésico'],
      'Cinestésico': ['Visual', 'Leitura/Escrita'],
      'Multimodal': ['Visual', 'Auditivo', 'Leitura/Escrita', 'Cinestésico']
    };

    if (varkComplements[profile1.varkProfile.dominant]?.includes(profile2.varkProfile.dominant)) {
      score += 1;
    }

    return score;
  };

  // Get complementarity level based on score
  const getComplementarityLevel = (score: number, teamSize: number): { level: string; color: string; description: string } => {
    const maxPossibleScore = (teamSize * (teamSize - 1) / 2) * 3; // Max 3 points per pair
    const percentage = (score / maxPossibleScore) * 100;

    if (percentage >= 70) {
      return {
        level: 'Alta',
        color: 'bg-green-100 text-green-800',
        description: 'Excelente equilíbrio entre perfis complementares'
      };
    } else if (percentage >= 40) {
      return {
        level: 'Média',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Bom equilíbrio com oportunidades de melhoria'
      };
    } else {
      return {
        level: 'Baixa',
        color: 'bg-red-100 text-red-800',
        description: 'Pouca complementaridade entre os perfis'
      };
    }
  };

  // Generate explanation for a team
  const generateTeamExplanation = (team: Team, criteria: GroupingCriteria): string => {
    if (team.members.length === 0) return "Equipe vazia";

    switch (criteria) {
      case 'mixed':
        const discTypes = team.members.map(m => m.profile.discProfile.dominant);
        const uniqueDisc = [...new Set(discTypes)];
        const varkTypes = team.members.map(m => m.profile.varkProfile.dominant);
        const uniqueVark = [...new Set(varkTypes)];

        let explanation = `Esta equipe foi formada com foco na complementaridade de perfis. `;

        if (uniqueDisc.length > 1) {
          explanation += `Combina diferentes estilos DISC (${uniqueDisc.join(', ')}) para equilibrar liderança, comunicação e organização. `;
        }

        if (uniqueVark.length > 1) {
          explanation += `Inclui diversos estilos de aprendizagem VARK (${uniqueVark.join(', ')}) para enriquecer as abordagens pedagógicas. `;
        }

        const complementarity = getComplementarityLevel(team.complementaryScore, team.members.length);
        explanation += `Nível de complementaridade: ${complementarity.level} (${complementarity.description}).`;

        return explanation;

      case 'disc':
        const discProfiles = team.members.map(m => m.profile.discProfile.dominant);
        const discCounts = discProfiles.reduce((acc, profile) => {
          acc[profile] = (acc[profile] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dominantDisc = Object.entries(discCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Misto';

        return `Equipe agrupada por perfis DISC similares. Perfil predominante: ${dominantDisc}. ` +
               `Isso facilita a comunicação e o trabalho colaborativo entre pessoas com estilos comportamentais compatíveis.`;

      case 'vark':
        const varkProfiles = team.members.map(m => m.profile.varkProfile.dominant);
        const varkCounts = varkProfiles.reduce((acc, profile) => {
          acc[profile] = (acc[profile] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dominantVark = Object.entries(varkCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Misto';

        return `Equipe formada por estudantes com estilos de aprendizagem VARK similares. ` +
               `Estilo predominante: ${dominantVark}. Isso otimiza o aprendizado quando todos preferem abordagens similares de conteúdo.`;

      case 'jungian':
        const jungianTypes = team.members.map(m => m.profile.jungianProfile.type);
        const jungianCounts = jungianTypes.reduce((acc, type) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dominantJungian = Object.entries(jungianCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Misto';

        return `Equipe agrupada por tipos jungianos compatíveis. Tipo predominante: ${dominantJungian}. ` +
               `Estudantes com tipos de personalidade similares tendem a se entender melhor e trabalhar de forma mais harmoniosa.`;

      default:
        return "Equipe formada aleatoriamente para distribuição equilibrada.";
    }
  };

  // Generate teams based on criteria
  const generateTeams = () => {
    if (studentsWithProfiles.length === 0) return;

    const shuffled = [...studentsWithProfiles].sort(() => Math.random() - 0.5);
    const newTeams: Team[] = [];
    const numTeams = Math.ceil(shuffled.length / groupSize);

    // Initialize empty teams
    for (let i = 0; i < numTeams; i++) {
      newTeams.push({
        id: `team-${i + 1}`,
        name: `Equipe ${i + 1}`,
        members: [],
        complementaryScore: 0,
        explanation: ""
      });
    }

    if (groupingCriteria === 'mixed') {
      // Smart assignment for complementary profiles
      shuffled.forEach((member, index) => {
        const teamIndex = index % numTeams;
        newTeams[teamIndex].members.push(member);
      });

      // Calculate complementary scores for each team
      newTeams.forEach(team => {
        let totalScore = 0;
        for (let i = 0; i < team.members.length; i++) {
          for (let j = i + 1; j < team.members.length; j++) {
            totalScore += calculateComplementaryScore(team.members[i].profile, team.members[j].profile);
          }
        }
        team.complementaryScore = totalScore;
        team.explanation = generateTeamExplanation(team, groupingCriteria);
      });
    } else {
      // Group by specific criteria
      const grouped = shuffled.reduce((acc, member) => {
        let key = '';
        switch (groupingCriteria) {
          case 'disc':
            key = member.profile.discProfile.dominant;
            break;
          case 'vark':
            key = member.profile.varkProfile.dominant;
            break;
          case 'jungian':
            key = member.profile.jungianProfile.type;
            break;
        }

        if (!acc[key]) acc[key] = [];
        acc[key].push(member);
        return acc;
      }, {} as Record<string, typeof shuffled>);

      // Distribute groups into teams
      let teamIndex = 0;
      Object.values(grouped).forEach(group => {
        group.forEach(member => {
          if (newTeams[teamIndex]) {
            newTeams[teamIndex].members.push(member);
            teamIndex = (teamIndex + 1) % numTeams;
          }
        });
      });

      // Generate explanations for each team
      newTeams.forEach(team => {
        team.explanation = generateTeamExplanation(team, groupingCriteria);
      });
    }

    setTeams(newTeams);
  };

  // Shuffle existing teams
  const shuffleTeams = () => {
    if (teams.length === 0) return;

    const allMembers = teams.flatMap(team => team.members);
    const shuffled = [...allMembers].sort(() => Math.random() - 0.5);
    const newTeams: Team[] = [];

    teams.forEach(team => {
      newTeams.push({
        ...team,
        members: []
      });
    });

    shuffled.forEach((member, index) => {
      const teamIndex = index % newTeams.length;
      newTeams[teamIndex].members.push(member);
    });

    // Recalculate scores and regenerate explanations
    newTeams.forEach(team => {
      let totalScore = 0;
      for (let i = 0; i < team.members.length; i++) {
        for (let j = i + 1; j < team.members.length; j++) {
          totalScore += calculateComplementaryScore(team.members[i].profile, team.members[j].profile);
        }
      }
      team.complementaryScore = totalScore;
      team.explanation = generateTeamExplanation(team, groupingCriteria);
    });

    setTeams(newTeams);
  };

  const getProfileBadgeColor = (criteria: GroupingCriteria, profile: UnifiedProfile) => {
    switch (criteria) {
      case 'disc':
        const discColors = {
          'Dominância': 'bg-red-100 text-red-800',
          'Influência': 'bg-yellow-100 text-yellow-800',
          'Estabilidade': 'bg-green-100 text-green-800',
          'Consciência': 'bg-blue-100 text-blue-800'
        };
        return discColors[profile.discProfile.dominant] || 'bg-gray-100 text-gray-800';
      case 'vark':
        const varkColors = {
          'Visual': 'bg-purple-100 text-purple-800',
          'Auditivo': 'bg-pink-100 text-pink-800',
          'Leitura/Escrita': 'bg-indigo-100 text-indigo-800',
          'Cinestésico': 'bg-orange-100 text-orange-800',
          'Multimodal': 'bg-gray-100 text-gray-800'
        };
        return varkColors[profile.varkProfile.dominant] || 'bg-gray-100 text-gray-800';
      case 'jungian':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileDisplayValue = (criteria: GroupingCriteria, profile: UnifiedProfile) => {
    switch (criteria) {
      case 'disc':
        return profile.discProfile.dominant;
      case 'vark':
        return profile.varkProfile.dominant;
      case 'jungian':
        return profile.jungianProfile.type;
      default:
        return 'Misto';
    }
  };

  // Sort teams based on complementarity score
  const sortedTeams = useMemo(() => {
    if (sortOrder === 'none' || groupingCriteria !== 'mixed') {
      return teams;
    }

    return [...teams].sort((a, b) => {
      if (sortOrder === 'best-first') {
        return b.complementaryScore - a.complementaryScore;
      } else {
        return a.complementaryScore - b.complementaryScore;
      }
    });
  }, [teams, sortOrder, groupingCriteria]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Users />
          Formação de equipes inteligente
        </CardTitle>
        <CardDescription>
          Crie equipes equilibradas com perfis complementares automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="groupSize">Tamanho do Grupo</Label>
            <Input
              id="groupSize"
              type="number"
              min="2"
              max="8"
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 4)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="criteria">Critério de Agrupamento</Label>
            <Select value={groupingCriteria} onValueChange={(value: GroupingCriteria) => setGroupingCriteria(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Equilibrado (Complementar)</SelectItem>
                <SelectItem value="disc">Por Perfil DISC</SelectItem>
                <SelectItem value="vark">Por Estilo VARK</SelectItem>
                <SelectItem value="jungian">Por Tipo Jungiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={generateTeams} className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Formar Equipes
            </Button>
            {teams.length > 0 && (
              <Button variant="outline" onClick={shuffleTeams}>
                <Shuffle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Teams Display */}
        {teams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Equipes Formadas ({teams.length})</h3>
              <div className="flex items-center gap-2">
                {groupingCriteria === 'mixed' && (
                  <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="best-first">Melhor primeiro</SelectItem>
                      <SelectItem value="worst-first">Pior primeiro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? 'Ocultar Detalhes' : 'Mostrar Detalhes'}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedTeams.map((team) => (
                <Card key={team.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      {groupingCriteria === 'mixed' && (
                        <Badge className={getComplementarityLevel(team.complementaryScore, team.members.length).color}>
                          {getComplementarityLevel(team.complementaryScore, team.members.length).level}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {team.members.map((member) => (
                      <div key={member.student.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{member.student.name}</span>
                        {showDetails && (
                          <Badge className={getProfileBadgeColor(groupingCriteria, member.profile)}>
                            {getProfileDisplayValue(groupingCriteria, member.profile)}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {/* Team Explanation */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {team.explanation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {studentsWithProfiles.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum aluno com perfil completo encontrado.</p>
            <p className="text-sm">Os alunos precisam completar o questionário para formar equipes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
