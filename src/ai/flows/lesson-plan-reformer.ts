'use server';

/**
 * @fileOverview AI-powered lesson plan reformulator.
 *
 * - reformLessonPlan - A function that takes a lesson plan and suggestions and rewrites the plan.
 * - ReformLessonPlanInput - The input type for the reformLessonPlan function.
 * - ReformLessonPlanOutput - The return type for the reformLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReformLessonPlanInputSchema = z.object({
  lessonPlan: z
    .string()
    .describe('The original lesson plan content provided by the teacher.'),
  suggestions: z
    .string()
    .describe('The list of suggestions provided by the pedagogical oracle.'),
});
export type ReformLessonPlanInput = z.infer<typeof ReformLessonPlanInputSchema>;

const ReformLessonPlanOutputSchema = z.object({
  reformulatedPlan: z
    .string()
    .describe('The reformulated lesson plan, incorporating the suggestions, in markdown format.'),
});
export type ReformLessonPlanOutput = z.infer<typeof ReformLessonPlanOutputSchema>;

export async function reformLessonPlan(input: ReformLessonPlanInput): Promise<ReformLessonPlanOutput> {
  return reformLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reformLessonPlanPrompt',
  input: {schema: ReformLessonPlanInputSchema},
  output: {schema: ReformLessonPlanOutputSchema},
  prompt: `Você é um designer instrucional sênior. Sua tarefa é pegar um plano de aula inicial e uma lista de sugestões de melhoria e reescrever o plano de aula original de forma coesa e criativa, incorporando as sugestões.

O resultado deve ser um plano de aula completo e prático, em formato markdown, que o professor possa usar diretamente. Use títulos (h1, h2), listas (com marcadores ou numeradas) e negrito para organizar bem o conteúdo. Não inclua a palavra 'Markdown' no resultado.

**Plano de Aula Original do Professor:**
---
{{lessonPlan}}
---

**Sugestões para Melhoria:**
---
{{suggestions}}
---

**Sua Versão Melhorada do Plano de Aula (em Markdown):**
`,
});

const reformLessonPlanFlow = ai.defineFlow(
  {
    name: 'reformLessonPlanFlow',
    inputSchema: ReformLessonPlanInputSchema,
    outputSchema: ReformLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
