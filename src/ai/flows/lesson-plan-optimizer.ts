'use server';

/**
 * @fileOverview AI-powered lesson plan optimizer for teachers.
 *
 * - optimizeLessonPlan - A function that accepts a lesson plan and class profile and returns optimized suggestions.
 * - OptimizeLessonPlanInput - The input type for the optimizeLessonPlan function.
 * - OptimizeLessonPlanOutput - The return type for the optimizeLessonan function.
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

const StrategyCardSchema = z.object({
  methodology: z.string().describe("The name of the innovative teaching methodology being suggested. E.g., 'Gamificação', 'Sala de Aula Invertida'."),
  iconName: z.string().describe("The name of a relevant icon from the lucide-react library. E.g., 'Swords', 'BookUp', 'Trophy'."),
  headline: z.string().describe("A catchy, impactful headline for the strategy."),
  details: z.string().describe("A practical, step-by-step description of how to implement the suggestion."),
  connection: z.string().describe("A brief explanation of WHY this strategy works for this specific class, referencing their profile."),
  reference: z.string().url().describe("A URL to an article or video for the teacher to learn more about the methodology.")
});

const OptimizeLessonPlanOutputSchema = z.object({
  strategies: z
    .array(StrategyCardSchema)
    .describe('A list of 2-4 disruptive and practical strategy cards to improve the lesson plan.'),
});
export type OptimizeLessonPlanOutput = z.infer<typeof OptimizeLessonPlanOutputSchema>;

export async function optimizeLessonPlan(input: OptimizeLessonPlanInput): Promise<OptimizeLessonPlanOutput> {
  return optimizeLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeLessonPlanPrompt',
  input: {schema: OptimizeLessonPlanInputSchema},
  output: {schema: OptimizeLessonPlanOutputSchema},
  prompt: `Você é um "Hacker de Design Instrucional" e um especialista em educação disruptiva. Sua missão é transformar uma aula comum em uma experiência de aprendizagem memorável, aplicando metodologias ativas e inovadoras que se conectem profundamente com a "personalidade" da turma.

Você receberá um resumo do perfil da turma (o "Mosaico de Aprendizagem") e a descrição de uma aula que o professor planejou.

Sua tarefa é hackear o plano de aula, devolvendo de 2 a 4 "Cards de Estratégia" práticos e criativos. Cada card deve ser baseado em uma metodologia de ensino ativa (ex: Gamificação, Sala de Aula Invertida, Rotação por Estações, Aprendizagem Baseada em Projetos, Peer Instruction, etc.).

Para cada card, forneça:
- methodology: O nome da metodologia.
- iconName: O nome de um ícone da biblioteca 'lucide-react' que represente a estratégia (ex: Swords, BookUp, Trophy, Puzzle, Users, Lightbulb). Verifique se o ícone existe.
- headline: Um título de impacto para a estratégia.
- details: Uma descrição prática de como implementar a sugestão.
- connection: A justificativa de por que essa estratégia funciona para ESTA turma específica, conectando com o perfil dela.
- reference: Um link para um artigo ou vídeo de alta qualidade para o professor se aprofundar na metodologia.

Seja criativo, ousado e prático.

---

**Exemplo de Resposta (Formato JSON):**
{
  "strategies": [
    {
      "methodology": "Gamificação",
      "iconName": "Swords",
      "headline": "A Batalha das Ideias",
      "details": "Transforme o debate em um jogo. Divida a turma em 'guildas' (grupos). Cada argumento bem-sucedido concede 'pontos de persuasão'. A guilda com mais pontos ao final 'conquista o parlamento'. Crie um placar visível para aumentar o engajamento.",
      "connection": "Funciona para esta turma pois eles são motivados por 'Desafio & Conquista'. A competição saudável e as metas claras irão engajá-los profundamente.",
      "reference": "https://www.youtube.com/watch?v=your_gamification_video_link"
    },
    {
      "methodology": "Sala de Aula Invertida",
      "iconName": "BookUp",
      "headline": "Detetives da História",
      "details": "Envie um vídeo curto ou um artigo intrigante sobre a Revolução Francesa para casa. Na sala de aula, em vez de expor o conteúdo, use o tempo para que eles, em grupos, resolvam um 'mistério' histórico usando as informações que aprenderam.",
      "connection": "Ideal para o perfil 'Absorção de Conteúdo Concreto & Prático' desta turma. Eles chegam na aula com a base e usam o tempo com o professor para aplicar o conhecimento de forma ativa.",
      "reference": "https://www.example.com/flipped-classroom-article"
    }
  ]
}

---

**Perfil da Turma (Mosaico de Aprendizagem):**
{{classProfile}}

---

**Plano de Aula do Professor:**
{{lessonPlan}}

---

**Seus Cards de Estratégia (Formato JSON):**
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
