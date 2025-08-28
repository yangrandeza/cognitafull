'use server';

import {
  optimizeLessonPlan,
  type OptimizeLessonPlanInput,
  type OptimizeLessonPlanOutput,
} from '@/ai/flows/lesson-plan-optimizer';

import {
  reformLessonPlan,
  type ReformLessonPlanInput,
  type ReformLessonPlanOutput,
} from '@/ai/flows/lesson-plan-reformer';

export async function getLessonPlanSuggestions(
  input: OptimizeLessonPlanInput
): Promise<OptimizeLessonPlanOutput> {
  try {
    const output = await optimizeLessonPlan(input);
    return output;
  } catch (error) {
    console.error('Error in getLessonPlanSuggestions:', error);
    // Retornar um objeto de erro estruturado pode ser melhor para o frontend
    return {
      suggestions: [
        {
          feature: 'Erro do Oráculo',
          suggestion:
            'Ocorreu um erro ao contatar a IA. Por favor, tente novamente mais tarde.',
        },
      ],
    };
  }
}


export async function getReformedLessonPlan(
  input: ReformLessonPlanInput
): Promise<ReformLessonPlanOutput> {
  try {
    const output = await reformLessonPlan(input);
    return output;
  } catch (error) {
    console.error("Error in getReformedLessonPlan:", error);
    return {
        reformulatedPlan: "Ocorreu um erro ao reformular o plano de aula. Por favor, tente novamente."
    }
  }
}
