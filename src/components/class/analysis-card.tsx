
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    category1Title: string;
    category1Value: string;
    category1Icon: React.ReactNode;
    category2Title: string;
    category2Value: string;
    category2Icon: React.ReactNode;
    text: string;
}

export function AnalysisCard({
    icon,
    title,
    subtitle,
    category1Title,
    category1Value,
    category1Icon,
    category2Title,
    category2Value,
    category2Icon,
    text
}: AnalysisCardProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-4">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10">
                        {icon}
                    </div>
                    <div>
                        <CardTitle className="font-headline text-xl">{title}</CardTitle>
                        <CardDescription>{subtitle}</CardDescription>
                    </div>
                 </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">{category1Title}</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                             {category1Icon}
                             <p className="font-semibold">{category1Value}</p>
                        </div>
                    </div>
                     <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground">{category2Title}</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            {category2Icon}
                            <p className="font-semibold">{category2Value}</p>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground pt-2 border-t border-border/50">{text}</p>
            </CardContent>
        </Card>
    );
}
