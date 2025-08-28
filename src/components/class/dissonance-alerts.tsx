import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function DissonanceAlerts({ data }: { data: { studentName: string; note: string }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <AlertCircle className="text-destructive" />
            Alertas de Dissonância
        </CardTitle>
        <CardDescription>Alunos com traços de perfil conflitantes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length > 0 ? data.map((alert, index) => (
          <div key={index} className="p-3 bg-destructive/10 rounded-lg">
            <p className="font-semibold text-destructive">{alert.studentName}</p>
            <p className="text-sm text-destructive/80">{alert.note}</p>
          </div>
        )) : <p className="text-sm text-muted-foreground">Nenhum alerta de dissonância para esta turma.</p>}
      </CardContent>
    </Card>
  );
}
