
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookMarked, Loader2 } from "lucide-react";
import type { LessonPlan } from "@/lib/types";
import { getSavedLessonPlans } from "@/lib/actions";
import ReactMarkdown from "react-markdown";

interface SavedLessonPlansProps {
    classId: string;
}

export function SavedLessonPlans({ classId }: SavedLessonPlansProps) {
    const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                const plans = await getSavedLessonPlans(classId);
                setSavedPlans(plans);
            } catch (error) {
                console.error("Failed to fetch lesson plans:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (classId) {
            fetchPlans();
        }
    }, [classId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <BookMarked className="text-primary" /> Planos de Aula Salvos
                </CardTitle>
                <CardDescription>
                    Acesse aqui os planos de aula que você já otimizou e salvou para esta turma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                     <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : savedPlans.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {savedPlans.map(plan => (
                            <AccordionItem value={plan.id} key={plan.id}>
                                <AccordionTrigger className="font-headline">{plan.title}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-lg bg-muted/20">
                                        <ReactMarkdown>{plan.reformulatedPlan}</ReactMarkdown>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-sm text-center text-muted-foreground p-4">Nenhum plano salvo ainda.</p>
                )}
            </CardContent>
        </Card>
    );
}
