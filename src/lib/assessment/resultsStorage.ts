/**
 * Utilitário para armazenar resultados de avaliações
 * 
 * Este módulo fornece uma camada de abstração que combina
 * armazenamento local (localStorage) e persistência no banco de dados.
 * 
 * Prioriza o banco de dados, mas mantém localStorage como fallback
 * para casos offline ou quando o usuário não está autenticado.
 */

import type { AssessmentResult } from '@/types/assessments';
import {
    saveAssessmentResult,
    getAssessmentResultsByAssessment,
    getLatestAssessmentResult,
    convertRowToAssessmentResult,
    convertRowToFiveMindResult,
} from './assessmentService';
import type { FiveMindResult } from '@/types/assessments';

const STORAGE_KEY = 'facilito_assessment_results';

/**
 * Salva os resultados de uma avaliação APENAS no banco de dados
 * 
 * IMPORTANTE: Esta função salva diretamente nas tabelas específicas:
 * - five_mind_results para FiveMind
 * - hexa_mind_results para HexaMind
 * 
 * Os triggers SQL automaticamente atualizam users.profile_analysis
 * com as características convertidas dos resultados.
 * 
 * @param userId - ID do usuário (obrigatório)
 * @param result - Resultado da avaliação a ser salvo
 * @throws Error se o usuário não estiver autenticado ou se houver erro ao salvar
 */
export async function saveResults(
    userId: string | null,
    result: AssessmentResult
): Promise<void> {
    console.log('📦 saveResults chamado:', { userId, assessmentId: result.assessmentId });

    if (!userId) {
        const error = new Error('Usuário não autenticado. É necessário estar logado para salvar resultados.');
        console.error('❌', error.message);
        throw error;
    }

    try {
        console.log('🔐 Usuário autenticado, salvando APENAS no banco de dados...');
        const saved = await saveAssessmentResult(userId, result);

        if (!saved) {
            const error = new Error('Falha ao salvar resultado no banco de dados. Retornou null.');
            console.error('❌', error.message);
            throw error;
        }

        console.log('✅ Resultado salvo no banco de dados com sucesso:', saved);
        console.log('🔄 O trigger SQL deve atualizar users.profile_analysis automaticamente');
    } catch (error) {
        console.error('❌ Erro ao salvar no banco de dados:', error);
        throw error; // Re-lança o erro para que o componente possa tratá-lo
    }
}

/**
 * Salva resultado no localStorage
 */
function saveToLocalStorage(result: AssessmentResult): void {
    try {
        const existingResults = getStoredResultsFromLocalStorage();
        const updatedResults = [...existingResults, result];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

/**
 * Recupera todos os resultados armazenados
 * Prioriza banco de dados, depois localStorage
 * 
 * @param userId - ID do usuário (opcional)
 * @returns Promise com array de resultados
 */
export async function getStoredResults(
    userId?: string | null
): Promise<AssessmentResult[]> {
    // Tenta buscar no banco de dados primeiro
    if (userId) {
        try {
            const dbResults = await getAssessmentResultsByAssessment(userId, 'five-mind');
            if (dbResults && dbResults.length > 0) {
                return dbResults.map(convertRowToAssessmentResult);
            }
        } catch (error) {
            console.warn('Erro ao buscar no banco, usando localStorage:', error);
        }
    }

    // Fallback para localStorage
    return getStoredResultsFromLocalStorage();
}

/**
 * Recupera resultados do localStorage
 */
function getStoredResultsFromLocalStorage(): AssessmentResult[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const results = JSON.parse(stored);
        // Converter datas de string para Date
        return results.map((result: any) => ({
            ...result,
            completedAt: new Date(result.completedAt),
        }));
    } catch (error) {
        console.error('Erro ao recuperar do localStorage:', error);
        return [];
    }
}

/**
 * Recupera resultados de uma avaliação específica
 * 
 * @param assessmentId - ID da avaliação
 * @param userId - ID do usuário (opcional)
 * @returns Promise com array de resultados
 */
export async function getResultsByAssessment(
    assessmentId: string,
    userId?: string | null
): Promise<AssessmentResult[]> {
    // Tenta buscar no banco de dados primeiro
    if (userId) {
        try {
            const dbResults = await getAssessmentResultsByAssessment(userId, assessmentId);
            if (dbResults.length > 0) {
                return dbResults.map(convertRowToAssessmentResult);
            }
        } catch (error) {
            console.warn('Erro ao buscar no banco, usando localStorage:', error);
        }
    }

    // Fallback para localStorage
    const allResults = getStoredResultsFromLocalStorage();
    return allResults.filter(result => result.assessmentId === assessmentId);
}

/**
 * Recupera o resultado mais recente de uma avaliação específica
 * 
 * @param assessmentId - ID da avaliação
 * @param userId - ID do usuário (opcional)
 * @returns Promise com o resultado mais recente ou null
 */
export async function getLatestResult(
    assessmentId: string,
    userId?: string | null
): Promise<AssessmentResult | null> {
    // Tenta buscar no banco de dados primeiro
    if (userId) {
        try {
            const latest = await getLatestAssessmentResult(userId, assessmentId);
            if (latest) {
                return convertRowToAssessmentResult(latest);
            }
        } catch (error) {
            console.warn('Erro ao buscar no banco, usando localStorage:', error);
        }
    }

    // Fallback para localStorage
    const results = await getResultsByAssessment(assessmentId, userId);
    return results.length > 0 ? results[0] : null;
}

/**
 * Limpa todos os resultados armazenados no localStorage
 * Nota: Não limpa do banco de dados por segurança
 */
export function clearResults(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
    }
}
