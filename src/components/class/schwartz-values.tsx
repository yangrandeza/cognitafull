import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SchwartzValues({ data }: { data: { value: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Valores Dominantes (Schwartz)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {data.map((item) => (
            <Badge key={item.value} variant="secondary" className="text-base px-3 py-1">
              {item.value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
