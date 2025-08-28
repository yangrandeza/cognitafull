"use server";

import {
  optimizeLessonPlan,
  type OptimizeLessonPlanInput,
  type OptimizeLessonPlanOutput,
} from "@/ai/flows/lesson-plan-optimizer";

export async function getLessonPlanSuggestions(
  input: OptimizeLessonPlanInput
): Promise<OptimizeLessonPlanOutput> {
  try {
    const output = await optimizeLessonPlan(input);
    return output;
  } catch (error) {
    console.error("Error in getLessonPlanSuggestions:", error);
    // Retornar um objeto de erro estruturado pode ser melhor para o frontend
    return { suggestions: ["Ocorreu um erro ao contatar a IA. Por favor, tente novamente mais tarde."] };
  }
}
