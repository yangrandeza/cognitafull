
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Eye } from "lucide-react";
import type { LessonPlan } from "@/lib/types";
import { LessonPlanDetailDialog } from "./lesson-plan-detail-dialog"; // Will create this
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedLessonPlansProps {
    savedPlans: LessonPlan[];
}

export function SavedLessonPlans({ savedPlans }: SavedLessonPlansProps) {
    const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewPlan = (plan: LessonPlan) => {
        setSelectedPlan(plan);
        setIsDialogOpen(true);
    };

    return (
        <>
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
                    {savedPlans.length > 0 ? (
                        <div className="space-y-4">
                            {savedPlans.map(plan => (
                                <Card key={plan.id} className="flex items-center justify-between p-4">
                                   <div>
                                        <h3 className="font-headline font-semibold">{plan.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Salvo em {format(new Date(plan.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </p>
                                   </div>
                                    <Button variant="outline" size="sm" onClick={() => handleViewPlan(plan)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver Detalhes
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-4">Nenhum plano salvo ainda.</p>
                    )}
                </CardContent>
            </Card>

            {selectedPlan && (
                <LessonPlanDetailDialog
                    plan={selectedPlan}
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                />
            )}
        </>
    );
}
