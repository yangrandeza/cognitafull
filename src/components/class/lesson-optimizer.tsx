
"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import { useReactToPrint } from "react-to-print";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lightbulb, Loader2, Sparkles, Wand2, FileDown, BookMarked, Save } from "lucide-react";
import { getLessonPlanSuggestions, getReformedLessonPlan, saveGeneratedLessonPlan, getSavedLessonPlans } from "@/lib/actions";
import type { OptimizeLessonPlanOutput } from "@/ai/flows/lesson-plan-optimizer";
import type { LessonPlan } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { cn } from "@/lib/utils";


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
}


// Create a new component that can be forwarded a ref
const PrintableContent = forwardRef<HTMLDivElement, { content: string }>(({ content }, ref) => {
  return (
    <div ref={ref} className="prose prose-sm dark:prose-invert max-w-none p-6 border rounded-lg bg-muted/20">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
});
PrintableContent.displayName = 'PrintableContent';


export function LessonOptimizer({ classProfileSummary, classId }: LessonOptimizerProps) {
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingReformed, setIsLoadingReformed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizeLessonPlanOutput['suggestions']>([]);
  const [reformulatedPlan, setReformulatedPlan] = useState("");
  const [savedPlans, setSavedPlans] = useState<LessonPlan[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "plano-de-aula-otimizado",
  });
  
  const fetchSavedPlans = async () => {
    setIsLoadingSaved(true);
    const plans = await getSavedLessonPlans(classId);
    setSavedPlans(plans);
    setIsLoadingSaved(false);
  };

  useEffect(() => {
    fetchSavedPlans();
  }, [classId]);

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
  
  const originalLessonPlan = form.getValues("lessonPlan");

  async function onGetSuggestions(values: z.infer<typeof formSchema>) {
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setReformulatedPlan("");
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
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  async function onReformPlan() {
    setIsLoadingReformed(true);
    try {
        const suggestionsText = suggestions.map(s => `Para ${s.feature}: ${s.suggestion}`).join('\n');
        const result = await getReformedLessonPlan({
            lessonPlan: originalLessonPlan,
            suggestions: suggestionsText,
        });
        if (result && result.reformulatedPlan) {
            setReformulatedPlan(result.reformulatedPlan);
        }
    } catch (error) {
        console.error("Erro ao reformular o plano de aula:", error);
        setReformulatedPlan("Ocorreu um erro ao tentar melhorar o plano. Tente novamente.");
    } finally {
        setIsLoadingReformed(false);
    }
  }

  async function onSavePlan(values: z.infer<typeof saveFormSchema>) {
    setIsSaving(true);
    try {
        const suggestionsText = suggestions.map(s => `Para ${s.feature}: ${s.suggestion}`).join('\n');
        const result = await saveGeneratedLessonPlan({
            classId,
            title: values.title,
            originalPlan: originalLessonPlan,
            suggestions: suggestionsText,
            reformulatedPlan: reformulatedPlan,
        });

        if (result.success) {
            toast({
                title: "Sucesso!",
                description: "Seu plano de aula foi salvo.",
            });
            // Reset state
            setReformulatedPlan("");
            setSuggestions([]);
            form.reset();
            saveForm.reset();
            setIsSaveDialogOpen(false);
            // Refresh the list of saved plans
            fetchSavedPlans();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error("Erro ao salvar o plano:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o plano de aula. Tente novamente.",
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
                    <BookMarked className="text-primary" /> Planos de Aula Salvos
                </CardTitle>
                <CardDescription>
                    Acesse aqui os planos de aula que você já otimizou e salvou para esta turma.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingSaved ? (
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

        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="text-primary" /> Oráculo Pedagógico
            </CardTitle>
            <CardDescription>
                Descreva sua próxima aula e o Oráculo usará a Bússola Cognitiva da turma para sugerir como torná-la inesquecível.
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
                        "Revelar Sugestões"
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
                        <h3 className="text-lg font-headline mb-4">Sugestões do Oráculo</h3>
                        <div className="space-y-6">
                            {suggestions.map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <Lightbulb className="h-6 w-6 mt-1 text-yellow-500 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-primary">{item.feature}:</p>
                                        <p className="text-muted-foreground">{item.suggestion}</p>
                                    </div>
                                </div>
                            ))}
                            <Button onClick={onReformPlan} disabled={isLoadingReformed || !!reformulatedPlan}>
                                {isLoadingReformed ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Melhorando...</>
                                ) : (
                                    <><Wand2 className="mr-2 h-4 w-4" /> Melhorar para Mim</>
                                )}
                                </Button>
                        </div>
                    </div>

                    {isLoadingReformed && (
                        <div className="flex items-center justify-center h-full pt-6">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {reformulatedPlan && (
                        <div className="space-y-4 pt-6 border-t">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-headline">Plano de Aula Melhorado</h3>
                                <div className="flex gap-2">
                                     <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="default">
                                                <Save className="mr-2 h-4 w-4" />
                                                Salvar Plano
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Salvar Plano de Aula</DialogTitle>
                                                <DialogDescription>
                                                    Dê um título para o seu plano de aula para que possa encontrá-lo mais tarde.
                                                </DialogDescription>
                                            </DialogHeader>
                                             <Form {...saveForm}>
                                                <form onSubmit={saveForm.handleSubmit(onSavePlan)} className="space-y-4">
                                                     <FormField
                                                        control={saveForm.control}
                                                        name="title"
                                                        render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Título do Plano</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: Revolução Francesa Interativa" {...field} />
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
                                    
                                     <button
                                        onClick={handlePrint}
                                        className={cn(buttonVariants({ variant: "outline" }))}
                                      >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Exportar para PDF
                                      </button>
                                </div>
                            </div>
                            <PrintableContent content={reformulatedPlan} ref={printRef} />
                        </div>
                    )}
                </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}

