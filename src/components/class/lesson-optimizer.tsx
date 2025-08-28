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

const formSchema = z.object({
  lessonPlan: z.string().min(50, {
    message: "O plano de aula deve ter pelo menos 50 caracteres.",
  }),
});

export function LessonOptimizer({ classProfileSummary }: { classProfileSummary: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

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
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary" /> Otimizador de Aula com IA
          </CardTitle>
          <CardDescription>
            Cole seu plano de aula abaixo e obtenha sugestões práticas e orientadas por IA, adaptadas ao perfil da sua turma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="lessonPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Plano de Aula</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: 'Tópico: Fotossíntese. Atividade: Aula expositiva por 20 min, depois uma atividade em grupo...'"
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
                    Analisando...
                  </>
                ) : (
                  "Otimizar Meu Plano"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Sugestões</CardTitle>
          <CardDescription>
            Aqui estão algumas maneiras de aprimorar seu plano:
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!isLoading && suggestions.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <p>Suas sugestões personalizadas por IA aparecerão aqui.</p>
            </div>
          )}
          {suggestions.length > 0 && (
            <ul className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 mt-1 text-yellow-500 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
