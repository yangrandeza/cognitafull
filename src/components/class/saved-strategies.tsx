
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Eye, Trash2 } from "lucide-react";
import type { LearningStrategy } from "@/lib/types";
import { StrategyDetailDialog } from "./lesson-plan-detail-dialog"; 
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { deleteLearningStrategy } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";


interface SavedStrategiesProps {
    savedStrategies: LearningStrategy[];
}

export function SavedStrategies({ savedStrategies: initialStrategies }: SavedStrategiesProps) {
    const [strategies, setStrategies] = useState(initialStrategies);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<LearningStrategy | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [strategyToDelete, setStrategyToDelete] = useState<string | null>(null);
    const { toast } = useToast();

     const openDeleteDialog = (strategyId: string) => {
        setStrategyToDelete(strategyId);
        setDialogOpen(true);
    };

    const openDetailModal = (strategy: LearningStrategy) => {
        setSelectedStrategy(strategy);
        setIsModalOpen(true);
    }

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
                title: "Erro ao excluir",
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
                        <BookMarked className="text-primary" /> Estratégias salvas
                    </CardTitle>
                    <CardDescription>
                        Acesse aqui as estratégias de aprendizagem que você já gerou e salvou para esta turma. Clique em um item para ver os detalhes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {strategies.length > 0 ? (
                        <div className="border rounded-md">
                            {strategies.map((strategySet, index) => (
                                <div 
                                    key={strategySet.id} 
                                    className={`flex items-center justify-between p-4 ${index < strategies.length - 1 ? 'border-b' : ''}`}
                                >
                                    <div className="flex flex-col flex-1 cursor-pointer" onClick={() => openDetailModal(strategySet)}>
                                        <span className="font-headline">{strategySet.title}</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Salvo em {format(new Date(strategySet.createdAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDetailModal(strategySet)}
                                            className="text-muted-foreground hover:text-primary"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteDialog(strategySet.id);
                                            }}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-4">Nenhuma estratégia salva ainda. Use o oráculo pedagógico para gerar e salvar sua primeira estratégia.</p>
                    )}
                </CardContent>
            </Card>

            {selectedStrategy && (
                <StrategyDetailDialog
                    strategy={selectedStrategy}
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                />
            )}

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
