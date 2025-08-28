
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Eye } from "lucide-react";
import type { LearningStrategy } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StrategyCard } from "./strategy-card";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SavedStrategiesProps {
    savedStrategies: LearningStrategy[];
}

export function SavedStrategies({ savedStrategies }: SavedStrategiesProps) {
    
    return (
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
                   <Accordion type="single" collapsible className="w-full">
                        {savedStrategies.map(strategySet => (
                             <AccordionItem value={strategySet.id} key={strategySet.id}>
                                <AccordionTrigger className="font-headline hover:no-underline">
                                    <div className="flex flex-col text-left">
                                        <span>{strategySet.title}</span>
                                         <span className="text-xs text-muted-foreground font-normal">
                                            Salvo em {format(new Date(strategySet.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                   <div className="space-y-4 pt-4 border-t">
                                     <p className="text-sm text-muted-foreground">
                                        Baseado na aula sobre: <span className="italic">"{strategySet.lessonPlan}"</span>
                                    </p>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {strategySet.strategies.map((strategy, index) => (
                                            <StrategyCard key={index} strategy={strategy} />
                                        ))}
                                    </div>
                                   </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                   </Accordion>
                ) : (
                    <p className="text-sm text-center text-muted-foreground p-4">Nenhuma estratégia salva ainda. Use o Oráculo Pedagógico para gerar e salvar sua primeira estratégia.</p>
                )}
            </CardContent>
        </Card>
    );
}
