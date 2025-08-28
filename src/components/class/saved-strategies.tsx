
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Trash2, Loader2 } from "lucide-react";
import type { LearningStrategy } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StrategyCard } from "./strategy-card";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { deleteLearningStrategy } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";


interface SavedStrategiesProps {
    savedStrategies: LearningStrategy[];
}

export function SavedStrategies({ savedStrategies: initialStrategies }: SavedStrategiesProps) {
    const [strategies, setStrategies] = useState(initialStrategies);
    const [isDeleting, setIsDeleting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);
    const { toast } = useToast();

    const openDeleteDialog = (strategyId: string) => {
        setStrategyToDelete(strategyId);
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!strategyToDelete) return;
        setIsDeleting(true);
        const result = await deleteLearningStrategy(strategyToDelete);
        
        if (result.success) {
            setStrategies(strategies.filter(s => s.id !== strategyToDelete));
            toast({
                title: "Sucesso!",
                description: "O conjunto de estratégias foi excluído.",
            });
        } else {
             toast({
                variant: "destructive",
                title: "Erro ao Excluir",
                description: result.error || "Não foi possível excluir as estratégias.",
            });
        }

        setIsDeleting(false);
        setDialogOpen(false);
        setStrategyToDelete(null);
    };

    const strategyTitle = strategies.find(s => s.id === strategyToDelete)?.title || "este item";
    
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
                    {strategies.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                            {strategies.map(strategySet => (
                                <AccordionItem value={strategySet.id} key={strategySet.id}>
                                    <div className="flex items-center justify-between pr-4">
                                        <AccordionTrigger className="font-headline hover:no-underline flex-1">
                                            <div className="flex flex-col text-left">
                                                <span>{strategySet.title}</span>
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    Salvo em {format(new Date(strategySet.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Impede que o accordion abra/feche
                                                openDeleteDialog(strategySet.id);
                                            }}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
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

            <DeleteConfirmationDialog
                isOpen={dialogOpen}
                setIsOpen={setDialogOpen}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Você tem certeza?"
                description={`Esta ação não pode ser desfeita. Isso irá remover permanentemente o conjunto de estratégias "${strategyTitle}".`}
            />
        </>
    );
}
