import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function SuggestedTeams({ data }: { data: { category: string; description: string; students: string[] }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Users />
            "Como formar equipes equilibradas?"
        </CardTitle>
        <CardDescription>Agrupe alunos por perfis complementares para otimizar o trabalho em equipe. Combine diferentes papéis para criar um time mais completo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length > 0 ? data.map((team, index) => (
          <div key={index}>
            <p className="font-semibold">{team.category}</p>
            <p className="text-xs text-muted-foreground mb-1">{team.description}</p>
            <p className="text-sm text-foreground/80">{team.students.join(', ')}</p>
          </div>
        )) : <p className="text-sm text-muted-foreground">Não há dados suficientes para sugerir equipes.</p>}
      </CardContent>
    </Card>
  );
}
