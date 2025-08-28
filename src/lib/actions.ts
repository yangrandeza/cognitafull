
'use server';

import {
  optimizeLessonPlan,
  type OptimizeLessonPlanInput,
  type OptimizeLessonPlanOutput,
} from '@/ai/flows/lesson-plan-optimizer';
import { saveStrategy as saveStrategyInDb, getStrategiesByClass as getStrategiesFromDb, deleteStrategy as deleteStrategyFromDb } from './firebase/firestore';
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
      strategies: [
        {
          methodology: 'Erro do Oráculo',
          iconName: 'AlertTriangle',
          headline: 'Ocorreu um erro ao contatar a IA',
          details: 'Não foi possível gerar sugestões no momento. Por favor, verifique o formato do seu plano de aula e tente novamente mais tarde.',
          connection: 'A conexão com o serviço de inteligência artificial falhou.',
          reference: 'https://status.cloud.google.com/'
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

export async function deleteLearningStrategy(strategyId: string): Promise<{success: boolean, error?: string}> {
    try {
        await deleteStrategyFromDb(strategyId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting learning strategy:", error);
        return { success: false, error: "Falha ao excluir a estratégia."};
    }
}
