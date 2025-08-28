
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Eye } from "lucide-react";
import type { LearningStrategy } from "@/lib/types";
import { StrategyDetailDialog } from "./lesson-plan-detail-dialog"; 
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedStrategiesProps {
    savedStrategies: LearningStrategy[];
}

export function SavedStrategies({ savedStrategies }: SavedStrategiesProps) {
    const [selectedStrategy, setSelectedStrategy] = useState<LearningStrategy | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleViewStrategy = (strategy: LearningStrategy) => {
        setSelectedStrategy(strategy);
        setIsDialogOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <BookMarked className="text-primary" /> Estratégias Salvas
                    </CardTitle>
                    <CardDescription>
                        Acesse aqui as estratégias de aprendizagem que você já gerou e salvou para esta turma.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {savedStrategies.length > 0 ? (
                        <div className="space-y-4">
                            {savedStrategies.map(strategy => (
                                <Card key={strategy.id} className="flex items-center justify-between p-4">
                                   <div>
                                        <h3 className="font-headline font-semibold">{strategy.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Salvo em {format(new Date(strategy.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </p>
                                   </div>
                                    <Button variant="outline" size="sm" onClick={() => handleViewStrategy(strategy)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver Detalhes
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-4">Nenhuma estratégia salva ainda. Use o Oráculo Pedagógico para gerar e salvar sua primeira estratégia.</p>
                    )}
                </CardContent>
            </Card>

            {selectedStrategy && (
                <StrategyDetailDialog
                    strategy={selectedStrategy}
                    isOpen={isDialogOpen}
                    setIsOpen={setIsDialogOpen}
                />
            )}
        </>
    );
}
