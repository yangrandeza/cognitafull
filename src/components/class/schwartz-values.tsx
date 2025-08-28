import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake } from "lucide-react";

export function SchwartzValues({ data }: { data: { value: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <HeartHandshake />
          "O que motiva esta turma?"
        </CardTitle>
        <CardDescription>Os valores dominantes (Schwartz) revelam as principais motivações. Ex: "Realização" sugere que a turma responde bem a metas claras.</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.map((item) => (
              <Badge key={item.value} variant="secondary" className="text-base px-3 py-1">
                {item.value} ({item.count})
              </Badge>
            ))}
          </div>
        ) : (
            <p className="text-sm text-muted-foreground">Nenhum dado de valor dominante ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
