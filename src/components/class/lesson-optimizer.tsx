
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { getLessonPlanSuggestions } from "@/lib/actions";
import type { OptimizeLessonPlanOutput } from "@/ai/flows/lesson-plan-optimizer";

const formSchema = z.object({
  lessonPlan: z.string().min(50, {
    message: "A descrição da aula deve ter pelo menos 50 caracteres.",
  }),
});

export function LessonOptimizer({ classProfileSummary }: { classProfileSummary: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<OptimizeLessonPlanOutput['suggestions']>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lessonPlan: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary" /> Oráculo Pedagógico
          </CardTitle>
          <CardDescription>
            Descreva sua próxima aula e o Oráculo usará a Bússola Cognitiva da turma para sugerir como torná-la inesquecível.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
            <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="lessonPlan"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Qual será o tema e a atividade principal da sua aula?</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Ex: 'Aula sobre a Revolução Francesa. Pretendo fazer uma exposição e depois um debate...'"
                            className="min-h-[200px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
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
            </div>
            <div className="flex flex-col rounded-lg border bg-muted/30 p-4">
                <div className="flex-grow">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                {!isLoading && suggestions.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <p>As sugestões do Oráculo aparecerão aqui.</p>
                    </div>
                )}
                {suggestions.length > 0 && (
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
                    </div>
                )}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
