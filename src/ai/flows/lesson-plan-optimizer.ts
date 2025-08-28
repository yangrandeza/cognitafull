'use server';

/**
 * @fileOverview AI-powered lesson plan optimizer for teachers.
 *
 * - optimizeLessonPlan - A function that accepts a lesson plan and class profile and returns optimized suggestions.
 * - OptimizeLessonPlanInput - The input type for the optimizeLessonPlan function.
 * - OptimizeLessonPlanOutput - The return type for the optimizeLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeLessonPlanInputSchema = z.object({
  lessonPlan: z
    .string()
    .describe('The lesson plan content provided by the teacher.'),
  classProfile: z
    .string()
    .describe('The aggregated learning profiles of the class (e.g., VARK, DISC, Jung, Schwartz).'),
});
export type OptimizeLessonPlanInput = z.infer<typeof OptimizeLessonPlanInputSchema>;

const OptimizeLessonPlanOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of 3-5 practical suggestions to improve the lesson plan.'),
});
export type OptimizeLessonPlanOutput = z.infer<typeof OptimizeLessonPlanOutputSchema>;

export async function optimizeLessonPlan(input: OptimizeLessonPlanInput): Promise<OptimizeLessonPlanOutput> {
  return optimizeLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeLessonPlanPrompt',
  input: {schema: OptimizeLessonPlanInputSchema},
  output: {schema: OptimizeLessonPlanOutputSchema},
  prompt: `Você é um designer instrucional e coach pedagógico especialista em aprendizado personalizado. Sua missão é ajudar um professor a tornar sua aula inesquecível, usando insights profundos sobre a "personalidade" da turma.

Você receberá um resumo do perfil da turma (o "Mosaico de Aprendizagem") e a descrição de uma aula que o professor planejou.

Sua tarefa é fornecer 3 a 5 sugestões práticas e criativas que conectem diretamente o plano de aula com as características da turma. Para cada sugestão, explique QUAL característica da turma você está usando como base.

Exemplo de como responder:
- "Para o lado 'Colaborativo' deles: Em vez de uma palestra, transforme a aula em um 'Conselho Revolucionário'. Divida a turma em grupos e dê a cada um um papel para debater."
- "Para a necessidade de 'Estrutura' deles: Forneça um 'mapa mental' com a linha do tempo e os principais eventos antes de começar. Isso dará a segurança que eles precisam."
- "Para engajar o lado 'Prático' deles: Peça que cada grupo crie um post de rede social (como se fosse da época) defendendo suas ideias. Isso torna o conteúdo concreto."

---

**Perfil da Turma (Mosaico de Aprendizagem):**
{{classProfile}}

---

**Plano de Aula do Professor:**
{{lessonPlan}}

---

**Suas Sugestões Otimizadas:**
`,
});

const optimizeLessonPlanFlow = ai.defineFlow(
  {
    name: 'optimizeLessonPlanFlow',
    inputSchema: OptimizeLessonPlanInputSchema,
    outputSchema: OptimizeLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
