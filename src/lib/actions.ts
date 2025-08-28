
'use server';

import {
  optimizeLessonPlan,
  type OptimizeLessonPlanInput,
  type OptimizeLessonPlanOutput,
} from '@/ai/flows/lesson-plan-optimizer';
import { saveStrategy as saveStrategyInDb, getStrategiesByClass as getStrategiesFromDb } from './firebase/firestore';
import { NewLearningStrategy, LearningStrategy } from './types';


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


export async function saveLearningStrategy(strategyData: Omit<NewLearningStrategy, 'createdAt'>): Promise<{success: boolean, error?: string}> {
    if (!strategyData.teacherId) {
        return { success: false, error: 'Usuário não autenticado.' };
    }

    try {
        const fullStrategyData: NewLearningStrategy = {
            ...strategyData,
            createdAt: new Date(),
        };
        await saveStrategyInDb(fullStrategyData); 
        return { success: true };
    } catch(error) {
        console.error("Error saving learning strategy:", error);
        return { success: false, error: "Falha ao salvar a estratégia."};
    }
}


export async function getSavedLearningStrategies(classId: string): Promise<LearningStrategy[]> {
    try {
        return await getStrategiesFromDb(classId);
    } catch (error) {
        console.error("Error fetching learning strategies:", error);
        return [];
    }
}
