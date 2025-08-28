
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

import { saveLessonPlan as savePlanInDb, getLessonPlansByClass as getPlansFromDb } from './firebase/firestore';
import { NewLessonPlan, LessonPlan } from './types';
import { revalidatePath } from 'next/cache';

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


export async function saveGeneratedLessonPlan(planData: Omit<NewLessonPlan, 'createdAt'>): Promise<{success: boolean, error?: string}> {
    if (!planData.teacherId) {
        return { success: false, error: 'Usuário não autenticado.' };
    }

    try {
        const fullPlanData: NewLessonPlan = {
            ...planData,
            createdAt: new Date(),
        };
        await savePlanInDb(fullPlanData as any); // Cast because serverTimestamp is handled by Firestore
        revalidatePath(`/class/${planData.classId}`);
        return { success: true };
    } catch(error) {
        console.error("Error saving lesson plan:", error);
        return { success: false, error: "Falha ao salvar o plano de aula."};
    }
}


export async function getSavedLessonPlans(classId: string): Promise<LessonPlan[]> {
    try {
        return await getPlansFromDb(classId);
    } catch (error) {
        console.error("Error fetching lesson plans:", error);
        return [];
    }
}
