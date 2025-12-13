/**
 * Serviço para gerenciar resultados de avaliações no banco de dados
 * 
 * Este serviço fornece funções para salvar, buscar e gerenciar
 * os resultados das avaliações no Supabase.
 * 
 * Para o FiveMind, os resultados são salvos em duas tabelas:
 * 1. assessment_results - resultados gerais (compatibilidade)
 * 2. five_mind_results - resultados detalhados do FiveMind (tabela específica)
 */

import { createClient } from '@/utils/supabase/client';
import type { AssessmentResult, FiveMindResult, HexaMindResult } from '@/types/assessments';
import type { Database } from '@/types/supabase';

/**
 * Interface para o resultado de avaliação no banco de dados
 */
export interface AssessmentResultRow {
    id: string;
    user_id: string;
    assessment_id: string;
    assessment_name: string;
    results: Record<string, any>;
    score: number | null;
    completed_at: string;
    created_at: string;
    updated_at: string;
}

/**
 * Salva os resultados de uma avaliação no banco de dados
 * 
 * Para o FiveMind, salva em duas tabelas:
 * 1. assessment_results - resultados gerais (compatibilidade)
 * 2. five_mind_results - resultados detalhados (tabela específica)
 * 
 * @param userId - ID do usuário que realizou a avaliação
 * @param result - Resultado da avaliação a ser salvo
 * @returns Promise com o resultado salvo ou null em caso de erro
 */
export async function saveAssessmentResult(
    userId: string,
    result: AssessmentResult
): Promise<AssessmentResultRow | null> {
    try {
        const supabase = createClient();

        // Log para debug
        console.log('📊 saveAssessmentResult - Iniciando salvamento:', {
            userId,
            assessmentId: result.assessmentId,
            results: result.results,
        });

        // NOTA: A tabela assessment_results é opcional e usada apenas para histórico/compatibilidade
        // O salvamento principal é feito nas tabelas específicas (five_mind_results ou hexa_mind_results)
        // que têm triggers que atualizam users.profile_analysis automaticamente

        // Tentar salvar na tabela geral (não crítico se falhar)
        try {
            console.log('📝 Tentando salvar em assessment_results (opcional)...');
            const { data, error } = await supabase
                .from('assessment_results')
                .insert({
                    user_id: userId,
                    assessment_id: result.assessmentId,
                    assessment_name: result.assessmentName,
                    results: result.results as any,
                    score: result.score || null,
                    completed_at: result.completedAt.toISOString(),
                } as any)
                .select()
                .single();

            if (error) {
                console.warn('⚠️ Erro ao salvar em assessment_results (não crítico):', error);
            } else {
                console.log('✅ Resultado também salvo em assessment_results:', data);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao salvar em assessment_results (não crítico):', error);
        }

        // IMPORTANTE: Salvar PRIMEIRO na tabela específica (five_mind_results ou hexa_mind_results)
        // O trigger SQL automaticamente atualiza users.profile_analysis com as características convertidas

        // Se for FiveMind, salvar na tabela específica (obrigatório)
        if (result.assessmentId === 'five-mind') {
            console.log('🧠 Detectado FiveMind, salvando em five_mind_results...');
            console.log('📋 Result.results:', result.results);

            if (!('openness' in result.results)) {
                const error = new Error('Resultado FiveMind não contém campo "openness". Estrutura inválida.');
                console.error('❌', error.message);
                throw error;
            }

            const fiveMindResult = result as FiveMindResult;
            console.log('📊 FiveMindResult completo:', fiveMindResult);

            const fiveMindData = await saveFiveMindResult(userId, fiveMindResult);
            if (!fiveMindData) {
                const error = new Error('Falha ao salvar resultado do FiveMind na tabela five_mind_results.');
                console.error('❌', error.message);
                throw error;
            }

            console.log('✅ Resultado do FiveMind salvo em five_mind_results:', fiveMindData);
            console.log('🔄 Trigger SQL deve atualizar users.profile_analysis automaticamente com características convertidas');
        }
        // Se for HexaMind, salvar na tabela específica (obrigatório)
        else if (result.assessmentId === 'hexa-mind') {
            console.log('🧠 Detectado HexaMind, salvando em hexa_mind_results...');
            console.log('📋 Result.results:', result.results);

            if (!('honesty' in result.results)) {
                const error = new Error('Resultado HexaMind não contém campo "honesty". Estrutura inválida.');
                console.error('❌', error.message);
                throw error;
            }

            const hexaMindResult = result as HexaMindResult;
            console.log('📊 HexaMindResult completo:', hexaMindResult);

            const hexaMindData = await saveHexaMindResult(userId, hexaMindResult);
            if (!hexaMindData) {
                const error = new Error('Falha ao salvar resultado do HexaMind na tabela hexa_mind_results.');
                console.error('❌', error.message);
                throw error;
            }

            console.log('✅ Resultado do HexaMind salvo em hexa_mind_results:', hexaMindData);
            console.log('🔄 Trigger SQL deve atualizar users.profile_analysis automaticamente com características convertidas');
        }
        else {
            const error = new Error(`Tipo de avaliação não suportado: ${result.assessmentId}. Apenas 'five-mind' e 'hexa-mind' são suportados.`);
            console.error('❌', error.message);
            throw error;
        }

        // Retornar sucesso (os dados já foram salvos nas tabelas específicas)
        // O retorno é apenas para compatibilidade, os dados reais estão nas tabelas específicas
        return {
            id: '',
            user_id: userId,
            assessment_id: result.assessmentId,
            assessment_name: result.assessmentName,
            results: result.results,
            score: result.score || null,
            completed_at: result.completedAt.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as AssessmentResultRow;
    } catch (error) {
        console.error('Erro ao salvar resultado da avaliação:', error);
        return null;
    }
}

/**
 * Salva os resultados detalhados do FiveMind na tabela específica
 * 
 * @param userId - ID do usuário que realizou a avaliação
 * @param result - Resultado do FiveMind
 * @returns Promise com o resultado salvo ou null em caso de erro
 */
export async function saveFiveMindResult(
    userId: string,
    result: FiveMindResult
): Promise<any | null> {
    try {
        const supabase = createClient();

        const insertData = {
            user_id: userId,
            openness: result.results.openness,
            conscientiousness: result.results.conscientiousness,
            extraversion: result.results.extraversion,
            agreeableness: result.results.agreeableness,
            neuroticism: result.results.neuroticism,
            overall_score: result.results.overallScore || null,
            completed_at: result.completedAt.toISOString(),
        };

        console.log('📝 Inserindo em five_mind_results:', insertData);

        const { data, error } = await supabase
            .from('five_mind_results')
            .insert(insertData as any)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao salvar resultado do FiveMind:', error);
            console.error('Detalhes do erro:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
            throw error;
        }

        console.log('✅ Resultado do FiveMind salvo com sucesso:', data);
        console.log('🔄 O trigger deve atualizar users.analise_perfil automaticamente');
        return data;
    } catch (error) {
        console.error('❌ Erro ao salvar resultado do FiveMind:', error);
        return null;
    }
}

/**
 * Busca todos os resultados de avaliações de um usuário
 * 
 * @param userId - ID do usuário
 * @returns Promise com array de resultados
 */
export async function getAssessmentResultsByUser(
    userId: string
): Promise<AssessmentResultRow[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('assessment_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar resultados:', error);
            throw error;
        }

        return (data || []) as AssessmentResultRow[];
    } catch (error) {
        console.error('Erro ao buscar resultados:', error);
        return [];
    }
}

/**
 * Busca resultados de uma avaliação específica para um usuário
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação
 * @returns Promise com array de resultados
 */
export async function getAssessmentResultsByAssessment(
    userId: string,
    assessmentId: string
): Promise<AssessmentResultRow[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('assessment_results')
            .select('*')
            .eq('user_id', userId)
            .eq('assessment_id', assessmentId)
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar resultados da avaliação:', error);
            throw error;
        }

        return (data || []) as AssessmentResultRow[];
    } catch (error) {
        console.error('Erro ao buscar resultados da avaliação:', error);
        return [];
    }
}

/**
 * Busca o resultado mais recente de uma avaliação específica para um usuário
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação
 * @returns Promise com o resultado mais recente ou null
 */
export async function getLatestAssessmentResult(
    userId: string,
    assessmentId: string
): Promise<AssessmentResultRow | null> {
    try {
        const results = await getAssessmentResultsByAssessment(userId, assessmentId);
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Erro ao buscar resultado mais recente:', error);
        return null;
    }
}

/**
 * Converte um resultado do banco de dados para o formato AssessmentResult
 * 
 * @param row - Linha do banco de dados
 * @returns AssessmentResult
 */
export function convertRowToAssessmentResult(row: AssessmentResultRow): AssessmentResult {
    return {
        assessmentId: row.assessment_id,
        assessmentName: row.assessment_name,
        completedAt: new Date(row.completed_at),
        score: row.score || undefined,
        results: row.results,
    };
}

/**
 * Salva os resultados detalhados do HexaMind na tabela específica
 * 
 * @param userId - ID do usuário que realizou a avaliação
 * @param result - Resultado do HexaMind
 * @returns Promise com o resultado salvo ou null em caso de erro
 */
export async function saveHexaMindResult(
    userId: string,
    result: HexaMindResult
): Promise<any | null> {
    try {
        const supabase = createClient();

        const insertData = {
            user_id: userId,
            honesty: result.results.honesty,
            emotional_stability: result.results.emotional_stability,
            extraversion: result.results.extraversion,
            agreeableness: result.results.agreeableness,
            conscientiousness: result.results.conscientiousness,
            openness: result.results.openness,
            consistency: result.results.consistency,
            response_consistency: result.results.responseConsistency,
            overall_score: result.results.overallScore || null,
            completed_at: result.completedAt.toISOString(),
        };

        console.log('📝 Inserindo em hexa_mind_results:', insertData);

        const { data, error } = await supabase
            .from('hexa_mind_results')
            .insert(insertData as any)
            .select()
            .single();

        if (error) {
            console.error('❌ Erro ao salvar resultado do HexaMind:', error);
            console.error('Detalhes do erro:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
            throw error;
        }

        console.log('✅ Resultado do HexaMind salvo com sucesso:', data);
        console.log('🔄 O trigger deve atualizar users.analise_perfil automaticamente');
        return data;
    } catch (error) {
        console.error('❌ Erro ao salvar resultado do HexaMind:', error);
        return null;
    }
}

/**
 * Converte um resultado do banco de dados para o formato FiveMindResult
 * 
 * @param row - Linha do banco de dados
 * @returns FiveMindResult
 */
export function convertRowToFiveMindResult(row: AssessmentResultRow): FiveMindResult {
    const result = convertRowToAssessmentResult(row);
    return {
        ...result,
        assessmentId: 'five-mind',
        assessmentName: 'FiveMind',
        results: row.results as FiveMindResult['results'],
    };
}

/**
 * Converte um resultado do banco de dados para o formato HexaMindResult
 * 
 * @param row - Linha do banco de dados
 * @returns HexaMindResult
 */
export function convertRowToHexaMindResult(row: AssessmentResultRow): HexaMindResult {
    const result = convertRowToAssessmentResult(row);
    return {
        ...result,
        assessmentId: 'hexa-mind',
        assessmentName: 'HexaMind',
        results: row.results as HexaMindResult['results'],
    };
}

