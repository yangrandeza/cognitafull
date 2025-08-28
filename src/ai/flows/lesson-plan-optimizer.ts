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
  prompt: `You are an AI assistant designed to help teachers optimize their lesson plans based on the learning profiles of their students.\n\nYou will receive a lesson plan and a summary of the class's learning profiles. Based on this information, provide 3-5 practical suggestions to improve the lesson plan.\n\nLesson Plan:\n{{lessonPlan}}\n\nClass Profile:\n{{classProfile}}\n\nSuggestions:
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
