
"use client";

import { Student, UnifiedProfile } from "@/lib/types";
import { generateStudentInsights, IndividualStudentInsights } from "@/lib/student-insights-generator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Rocket, Heart, BookOpen, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

interface InsightQuadrantProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}

function InsightQuadrant({ icon, title, children }: InsightQuadrantProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex-row items-center gap-4 pb-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle className="font-headline text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground">{children}</div>
            </CardContent>
        </Card>
    );
}

interface StudentDashboardProps {
    student: Student;
    profile: UnifiedProfile;
}

export function StudentDashboard({ student, profile }: StudentDashboardProps) {
    const [insights, setInsights] = useState<IndividualStudentInsights | null>(null);

    useEffect(() => {
        if (profile) {
            const generatedInsights = generateStudentInsights(profile);
            setInsights(generatedInsights);
        }
    }, [profile]);

    if (!insights) {
        return <div>Gerando insights...</div>
    }

    // Helper para renderizar o manual com quebras de linha e negrito
    const renderManual = (manualText: string) => {
        return manualText.split('\n').map((line, index) => {
            if (line.startsWith('**')) {
                 const parts = line.split('**');
                 return <p key={index} className="mt-2"><strong className="text-foreground">{parts[1]}</strong> {parts[2]}</p>
            }
            return <span key={index}>{line}</span>
        })
    }

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Seu Mosaico de Aprendizagem</CardTitle>
                    <CardDescription>
                        Este é um resumo de como você aprende, interage e se motiva. Use esses insights para entender seus pontos fortes e como você pode aprender ainda melhor!
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InsightQuadrant 
                    icon={<Brain className="h-6 w-6" />}
                    title="Minha Mente em Foco 🧘‍♀️"
                >
                   <p>{insights.mind}</p>
                </InsightQuadrant>
                <InsightQuadrant 
                    icon={<Rocket className="h-6 w-6" />}
                    title="Meus Superpoderes 🚀"
                >
                   <p>{insights.superpowers}</p>
                </InsightQuadrant>
                <InsightQuadrant 
                    icon={<Heart className="h-6 w-6" />}
                    title="O Que Me Move ❤️"
                >
                    <p>{insights.motivation}</p>
                </InsightQuadrant>
                <InsightQuadrant
                    icon={<BookOpen className="h-6 w-6" />}
                    title="Meu 'Manual de Instruções' 📖"
                >
                    {renderManual(insights.manual)}
                </InsightQuadrant>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Lightbulb className="text-amber-500"/>
                        Dicas para Voar Mais Alto
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                       {insights.tips.map((tip, index) => (
                           <li key={index}>{tip}</li>
                       ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
