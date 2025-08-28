
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    text: string;
}

export function InsightCard({ icon, title, subtitle, text }: InsightCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
                 <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10">
                    {icon}
                 </div>
                 <div>
                    <CardTitle className="font-headline text-xl">{title}</CardTitle>
                    <CardDescription>{subtitle}</CardDescription>
                 </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground">{text}</p>
            </CardContent>
        </Card>
    );
}
