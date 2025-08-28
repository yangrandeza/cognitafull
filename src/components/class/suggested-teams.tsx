import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export function SuggestedTeams({ data }: { data: { category: string; students: string[] }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Users />
            Equipes Sugeridas
        </CardTitle>
        <CardDescription>Agrupe alunos por perfis complementares.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((team) => (
          <div key={team.category}>
            <p className="font-semibold">{team.category}</p>
            <p className="text-sm text-muted-foreground">{team.students.join(', ')}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
