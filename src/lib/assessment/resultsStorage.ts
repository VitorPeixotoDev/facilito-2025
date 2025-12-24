/**
 * Utilitário para armazenar e buscar resultados de avaliações
 * 
 * Este módulo trabalha EXCLUSIVAMENTE com o banco de dados.
 * Todos os resultados são salvos e buscados diretamente das tabelas:
 * - five_mind_results para FiveMind
 * - hexa_mind_results para HexaMind
 * 
 * Os triggers SQL automaticamente atualizam users.profile_analysis
 * com as características convertidas dos resultados.
 */

import type { AssessmentResult } from '@/types/assessments';
import {
    saveAssessmentResult,
    getAssessmentResultsByAssessment,
    getLatestAssessmentResult,
    convertRowToAssessmentResult,
} from './assessmentService';

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
 * Recupera todos os resultados armazenados do banco de dados
 * 
 * @param userId - ID do usuário (obrigatório)
 * @param assessmentId - ID da avaliação (opcional, se não fornecido busca todos)
 * @returns Promise com array de resultados
 */
export async function getStoredResults(
    userId: string,
    assessmentId?: string
): Promise<AssessmentResult[]> {
    if (!userId) {
        console.warn('getStoredResults: userId é obrigatório');
        return [];
    }

    try {
        if (assessmentId) {
            const dbResults = await getAssessmentResultsByAssessment(userId, assessmentId);
            return dbResults.map(convertRowToAssessmentResult);
        } else {
            // Se não especificou assessmentId, busca todos (FiveMind e HexaMind)
            const fiveMindResults = await getAssessmentResultsByAssessment(userId, 'five-mind');
            const hexaMindResults = await getAssessmentResultsByAssessment(userId, 'hexa-mind');
            return [
                ...fiveMindResults.map(convertRowToAssessmentResult),
                ...hexaMindResults.map(convertRowToAssessmentResult),
            ];
        }
    } catch (error) {
        console.error('Erro ao buscar resultados do banco de dados:', error);
        return [];
    }
}

/**
 * Recupera resultados de uma avaliação específica do banco de dados
 * 
 * @param assessmentId - ID da avaliação
 * @param userId - ID do usuário (obrigatório)
 * @returns Promise com array de resultados
 */
export async function getResultsByAssessment(
    assessmentId: string,
    userId: string
): Promise<AssessmentResult[]> {
    if (!userId) {
        console.warn('getResultsByAssessment: userId é obrigatório');
        return [];
    }

    try {
        const dbResults = await getAssessmentResultsByAssessment(userId, assessmentId);
        return dbResults.map(convertRowToAssessmentResult);
    } catch (error) {
        console.error('Erro ao buscar resultados do banco de dados:', error);
        return [];
    }
}

/**
 * Recupera o resultado mais recente de uma avaliação específica do banco de dados
 * 
 * @param assessmentId - ID da avaliação
 * @param userId - ID do usuário (obrigatório)
 * @returns Promise com o resultado mais recente ou null
 */
export async function getLatestResult(
    assessmentId: string,
    userId: string | null
): Promise<AssessmentResult | null> {
    if (!userId) {
        console.warn('getLatestResult: userId é obrigatório');
        return null;
    }

    try {
        const latest = await getLatestAssessmentResult(userId, assessmentId);
        if (latest) {
            return convertRowToAssessmentResult(latest);
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar resultado mais recente do banco de dados:', error);
        return null;
    }
}

