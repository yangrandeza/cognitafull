
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lightbulb, Loader2, Sparkles, Save } from "lucide-react";
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
  const [suggestions, setSuggestions] = useState<OptimizeLessonPlanOutput['suggestions']>([]);
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
    setSuggestions([]);
    try {
      const result = await getLessonPlanSuggestions({
        lessonPlan: values.lessonPlan,
        classProfile: classProfileSummary,
      });
      if (result && result.suggestions) {
        setSuggestions(result.suggestions);
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
        const suggestionsText = suggestions.map(s => `* **${s.feature}:** ${s.suggestion}`).join('\n');
        
        await saveLearningStrategy({
            classId,
            teacherId,
            title: values.title,
            originalLessonPlan: form.getValues("lessonPlan"),
            suggestions: suggestionsText,
        });

        // Reset state and notify parent
        setSuggestions([]);
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
                        "Revelar Estratégias"
                        )}
                    </Button>
                    </form>
                </Form>

                {/* --- Results Area --- */}
                {isLoadingSuggestions && (
                <div className="flex items-center justify-center pt-6 border-t">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                )}

                {suggestions.length > 0 && (
                <div className="space-y-6 pt-6 border-t">
                    <div>
                         <div className="flex justify-between items-center">
                            <h3 className="text-lg font-headline mb-4">Estratégias Sugeridas</h3>
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

                        <div className="space-y-6 mt-4">
                            {suggestions.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                                    <Lightbulb className="h-6 w-6 mt-1 text-yellow-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-primary">{item.feature}:</p>
                                        <p className="text-muted-foreground">{item.suggestion}</p>
                                    </div>
                                </div>
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
