
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Sparkles, Save, WandSparkles } from "lucide-react";
import { getLessonPlanSuggestions, saveLearningStrategy } from "@/lib/actions";
import type { OptimizeLessonPlanOutput } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StrategyCard } from "./strategy-card";


const formSchema = z.object({
  lessonPlan: z.string().min(50, {
    message: "A descrição da aula deve ter pelo menos 50 caracteres.",
  }),
});

const saveFormSchema = z.object({
    title: z.string().min(5, {
        message: "O título deve ter pelo menos 5 caracteres.",
    })
});

interface LessonOptimizerProps {
    classProfileSummary: string;
    classId: string;
    teacherId: string;
    onStrategySaved: () => void;
}


export function LessonOptimizer({ classProfileSummary, classId, teacherId, onStrategySaved }: LessonOptimizerProps) {
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [strategies, setStrategies] = useState<OptimizeLessonPlanOutput['strategies']>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lessonPlan: "",
    },
  });

  const saveForm = useForm<z.infer<typeof saveFormSchema>>({
    resolver: zodResolver(saveFormSchema),
    defaultValues: {
        title: "",
    }
  });

  async function onGetSuggestions(values: z.infer<typeof formSchema>) {
    setIsLoadingSuggestions(true);
    setStrategies([]);
    try {
      const result = await getLessonPlanSuggestions({
        lessonPlan: values.lessonPlan,
        classProfile: classProfileSummary,
      });
      if (result && result.strategies) {
        setStrategies(result.strategies);
      }
    } catch (error) {
      console.error("Erro ao otimizar o plano de aula:", error);
       toast({
        variant: "destructive",
        title: "Erro do Oráculo",
        description: "Não foi possível gerar sugestões. Tente novamente.",
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  async function onSaveStrategies(values: z.infer<typeof saveFormSchema>) {
    setIsSaving(true);
    try {
        const suggestionsText = strategies.map(s => `### ${s.methodology}: ${s.headline}\n\n**Como Fazer:** ${s.details}\n\n**Por que Funciona:** ${s.connection}\n\n**Para Saber Mais:** [Clique aqui](${s.reference})`).join('\n\n---\n\n');
        
        await saveLearningStrategy({
            classId,
            teacherId,
            title: values.title,
            originalLessonPlan: form.getValues("lessonPlan"),
            suggestions: suggestionsText,
        });

        // Reset state and notify parent
        setStrategies([]);
        form.reset();
        saveForm.reset();
        setIsSaveDialogOpen(false);
        onStrategySaved();
        
    } catch (error) {
        console.error("Erro ao salvar as estratégias:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar as estratégias. Tente novamente.",
        });
    } finally {
        setIsSaving(false);
    }
  }
  
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="text-primary" /> Oráculo Pedagógico
            </CardTitle>
            <CardDescription>
                Descreva sua próxima aula e o Oráculo usará a Bússola Cognitiva da turma para sugerir estratégias de aprendizagem para torná-la inesquecível.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onGetSuggestions)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="lessonPlan"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Qual será o tema e a atividade principal da sua aula?</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Ex: 'Aula sobre a Revolução Francesa. Pretendo fazer uma exposição e depois um debate...'"
                                className="min-h-[150px]"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoadingSuggestions}>
                        {isLoadingSuggestions ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Consultando...
                        </>
                        ) : (
                           <>
                            <WandSparkles className="mr-2 h-4 w-4" />
                            Revelar Estratégias
                           </>
                        )}
                    </Button>
                    </form>
                </Form>

                {/* --- Results Area --- */}
                {isLoadingSuggestions && (
                <div className="flex items-center justify-center pt-10 border-t">
                    <div className="text-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">O Oráculo está mergulhando nos dados da sua turma...</p>
                    </div>
                </div>
                )}

                {strategies.length > 0 && (
                <div className="space-y-8 pt-6 border-t">
                    <div>
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-headline">Cards de Estratégia</h3>
                             <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="default">
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar Estratégias
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Salvar Estratégias de Aprendizagem</DialogTitle>
                                        <DialogDescription>
                                            Dê um título para este conjunto de estratégias para que possa encontrá-lo mais tarde.
                                        </DialogDescription>
                                    </DialogHeader>
                                     <Form {...saveForm}>
                                        <form onSubmit={saveForm.handleSubmit(onSaveStrategies)} className="space-y-4">
                                             <FormField
                                                control={saveForm.control}
                                                name="title"
                                                render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Título</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Estratégias para Aula de História" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <DialogFooter>
                                                <Button type="button" variant="ghost" onClick={() => setIsSaveDialogOpen(false)}>Cancelar</Button>
                                                <Button type="submit" disabled={isSaving}>
                                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Salvar
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                         </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {strategies.map((item, index) => (
                                <StrategyCard key={index} strategy={item} />
                            ))}
                        </div>
                    </div>
                </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
