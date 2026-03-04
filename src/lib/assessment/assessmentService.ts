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
 * Adiciona uma certificação ao histórico do usuário
 * Garante que cada certificação seja única (não importa quantas vezes o usuário concluiu)
 * 
 * @param userId - ID do usuário
 * @param certificationName - Nome da certificação ('fivemind' ou 'sixmind')
 */
async function addUserCertification(userId: string, certificationName: 'fivemind' | 'sixmind'): Promise<void> {
    try {
        const supabase = createClient();

        // Buscar certificações atuais do usuário
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('certifications')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.warn(`⚠️ Erro ao buscar certificações do usuário ${userId}:`, fetchError);
            return;
        }

        // Obter array atual de certificações (ou array vazio se null)
        // Usar type assertion pois a coluna pode não estar no tipo gerado ainda
        const currentCertifications = ((userData as any)?.certifications || []) as string[];

        // Verificar se a certificação já existe (case-insensitive)
        const certificationLower = certificationName.toLowerCase();
        const alreadyExists = currentCertifications.some(
            cert => cert.toLowerCase() === certificationLower
        );

        if (alreadyExists) {
            console.log(`ℹ️ Certificação '${certificationName}' já existe para o usuário ${userId}`);
            return;
        }

        // Adicionar nova certificação ao array
        const updatedCertifications = [...currentCertifications, certificationName];

        // Atualizar no banco de dados
        // Usar type assertion pois a coluna certifications pode não estar no tipo gerado ainda
        const updateData = {
            certifications: updatedCertifications,
            updated_at: new Date().toISOString()
        };
        const { error: updateError } = await (supabase
            .from('users') as any)
            .update(updateData)
            .eq('id', userId);

        if (updateError) {
            console.error(`❌ Erro ao atualizar certificações do usuário ${userId}:`, updateError);
        } else {
            console.log(`✅ Certificação '${certificationName}' adicionada ao usuário ${userId}`);
        }
    } catch (error) {
        console.error(`❌ Erro ao adicionar certificação '${certificationName}' ao usuário ${userId}:`, error);
    }
}

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
 * @param authorization - Dados de autorização (opcional)
 * @returns Promise com o resultado salvo ou null em caso de erro
 */
export async function saveAssessmentResult(
    userId: string,
    result: AssessmentResult,
    authorization?: {
        authorizedForSuggestions?: boolean;
        authorizedToShowResults?: boolean;
        expiresAt?: Date;
    }
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

        const slug = result.assessmentSlug ?? (result.assessmentId === 'five-mind' ? 'five-mind' : result.assessmentId === 'hexa-mind' ? 'hexa-mind' : null);
        // Se for FiveMind, salvar na tabela específica (obrigatório)
        if (slug === 'five-mind') {
            console.log('🧠 Detectado FiveMind, salvando em five_mind_results...');
            console.log('📋 Result.results:', result.results);

            if (!('openness' in result.results)) {
                const error = new Error('Resultado FiveMind não contém campo "openness". Estrutura inválida.');
                console.error('❌', error.message);
                throw error;
            }

            const fiveMindResult = result as FiveMindResult;
            console.log('📊 FiveMindResult completo:', fiveMindResult);

            const fiveMindData = await saveFiveMindResult(userId, fiveMindResult, authorization);
            if (!fiveMindData) {
                const error = new Error('Falha ao salvar resultado do FiveMind na tabela five_mind_results.');
                console.error('❌', error.message);
                throw error;
            }

            console.log('✅ Resultado do FiveMind salvo em five_mind_results:', fiveMindData);
            console.log('🔄 Trigger SQL deve atualizar users.profile_analysis automaticamente com características convertidas');

            // Adicionar certificação 'fivemind' ao histórico do usuário
            await addUserCertification(userId, 'fivemind');
        }
        // Se for HexaMind, salvar na tabela específica (obrigatório)
        else if (slug === 'hexa-mind') {
            console.log('🧠 Detectado HexaMind, salvando em hexa_mind_results...');
            console.log('📋 Result.results:', result.results);

            if (!('honesty' in result.results)) {
                const error = new Error('Resultado HexaMind não contém campo "honesty". Estrutura inválida.');
                console.error('❌', error.message);
                throw error;
            }

            const hexaMindResult = result as HexaMindResult;
            console.log('📊 HexaMindResult completo:', hexaMindResult);

            const hexaMindData = await saveHexaMindResult(userId, hexaMindResult, authorization);
            if (!hexaMindData) {
                const error = new Error('Falha ao salvar resultado do HexaMind na tabela hexa_mind_results.');
                console.error('❌', error.message);
                throw error;
            }

            console.log('✅ Resultado do HexaMind salvo em hexa_mind_results:', hexaMindData);
            console.log('🔄 Trigger SQL deve atualizar users.profile_analysis automaticamente com características convertidas');

            // Adicionar certificação 'sixmind' ao histórico do usuário
            await addUserCertification(userId, 'sixmind');
        }
        else {
            const error = new Error(`Tipo de avaliação não suportado: ${slug ?? result.assessmentId}. Apenas 'five-mind' e 'hexa-mind' são suportados.`);
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
 * @param authorization - Dados de autorização (opcional)
 * @returns Promise com o resultado salvo ou null em caso de erro
 */
export async function saveFiveMindResult(
    userId: string,
    result: FiveMindResult,
    authorization?: {
        authorizedForSuggestions?: boolean;
        authorizedToShowResults?: boolean;
        expiresAt?: Date;
    }
): Promise<any | null> {
    try {
        const supabase = createClient();

        // Calcular expires_at (padrão: 1 ano após completed_at se não fornecido)
        const expiresAt = authorization?.expiresAt
            ? authorization.expiresAt.toISOString()
            : new Date(result.completedAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

        const insertData = {
            user_id: userId,
            openness: result.results.openness,
            conscientiousness: result.results.conscientiousness,
            extraversion: result.results.extraversion,
            agreeableness: result.results.agreeableness,
            neuroticism: result.results.neuroticism,
            overall_score: result.results.overallScore || null,
            completed_at: result.completedAt.toISOString(),
            authorized_for_suggestions: authorization?.authorizedForSuggestions ?? true,
            authorized_to_show_results: authorization?.authorizedToShowResults ?? false,
            expires_at: expiresAt,
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
 * Converte um resultado do five_mind_results para AssessmentResult
 */
function convertFiveMindRowToAssessmentResult(row: any): AssessmentResult {
    return {
        assessmentId: 'five-mind',
        assessmentSlug: 'five-mind',
        assessmentName: 'FiveMind',
        completedAt: new Date(row.completed_at),
        score: row.overall_score || undefined,
        results: {
            openness: Number(row.openness),
            conscientiousness: Number(row.conscientiousness),
            extraversion: Number(row.extraversion),
            agreeableness: Number(row.agreeableness),
            neuroticism: Number(row.neuroticism),
            overallScore: row.overall_score || 0,
        },
    };
}

/**
 * Converte um resultado do hexa_mind_results para AssessmentResult
 */
function convertHexaMindRowToAssessmentResult(row: any): AssessmentResult {
    return {
        assessmentId: 'hexa-mind',
        assessmentSlug: 'hexa-mind',
        assessmentName: 'HexaMind',
        completedAt: new Date(row.completed_at),
        score: row.overall_score || undefined,
        results: {
            honesty: Number(row.honesty),
            emotional_stability: Number(row.emotional_stability),
            extraversion: Number(row.extraversion),
            agreeableness: Number(row.agreeableness),
            conscientiousness: Number(row.conscientiousness),
            openness: Number(row.openness),
            consistency: Number(row.consistency),
            overallScore: row.overall_score || 0,
            responseConsistency: Number(row.response_consistency),
        },
    };
}

/**
 * Busca resultados de uma avaliação específica para um usuário
 * Busca diretamente nas tabelas específicas (five_mind_results ou hexa_mind_results)
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação ('five-mind' ou 'hexa-mind')
 * @returns Promise com array de resultados
 */
export async function getAssessmentResultsByAssessment(
    userId: string,
    assessmentId: string
): Promise<AssessmentResultRow[]> {
    try {
        const supabase = createClient();
        const results: AssessmentResultRow[] = [];

        // Buscar diretamente na tabela específica
        if (assessmentId === 'five-mind') {
            const { data, error } = await supabase
                .from('five_mind_results')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar resultados do FiveMind:', error);
                return [];
            }

            if (data && data.length > 0) {
                for (const row of data as any[]) {
                    const result = convertFiveMindRowToAssessmentResult(row);
                    results.push({
                        id: row.id,
                        user_id: userId,
                        assessment_id: 'five-mind',
                        assessment_name: 'FiveMind',
                        results: result.results,
                        score: result.score || null,
                        completed_at: result.completedAt.toISOString(),
                        created_at: new Date(row.created_at).toISOString(),
                        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
                    } as AssessmentResultRow);
                }
            }
        } else if (assessmentId === 'hexa-mind') {
            const { data, error } = await supabase
                .from('hexa_mind_results')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar resultados do HexaMind:', error);
                return [];
            }

            if (data && data.length > 0) {
                for (const row of data as any[]) {
                    const result = convertHexaMindRowToAssessmentResult(row);
                    results.push({
                        id: row.id,
                        user_id: userId,
                        assessment_id: 'hexa-mind',
                        assessment_name: 'HexaMind',
                        results: result.results,
                        score: result.score || null,
                        completed_at: result.completedAt.toISOString(),
                        created_at: new Date(row.created_at).toISOString(),
                        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
                    } as AssessmentResultRow);
                }
            }
        } else {
            console.warn(`Tipo de avaliação não suportado: ${assessmentId}`);
            return [];
        }

        return results;
    } catch (error) {
        console.error('Erro ao buscar resultados da avaliação:', error);
        return [];
    }
}

/**
 * Busca o resultado mais recente de uma avaliação específica para um usuário
 * Busca diretamente nas tabelas específicas (five_mind_results ou hexa_mind_results)
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação ('five-mind' ou 'hexa-mind')
 * @returns Promise com o resultado mais recente ou null
 */
export async function getLatestAssessmentResult(
    userId: string,
    assessmentId: string
): Promise<AssessmentResultRow | null> {
    try {
        const supabase = createClient();

        // Buscar diretamente na tabela específica
        if (assessmentId === 'five-mind') {
            const { data, error } = await supabase
                .from('five_mind_results')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                // Se não encontrar, retorna null (não é erro crítico)
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Erro ao buscar resultado do FiveMind:', error);
                return null;
            }

            if (!data) return null;

            // Converter para o formato AssessmentResultRow
            const result = convertFiveMindRowToAssessmentResult(data as any);
            return {
                id: (data as any).id,
                user_id: userId,
                assessment_id: 'five-mind',
                assessment_name: 'FiveMind',
                results: result.results,
                score: result.score || null,
                completed_at: result.completedAt.toISOString(),
                created_at: new Date((data as any).created_at).toISOString(),
                updated_at: (data as any).updated_at ? new Date((data as any).updated_at).toISOString() : null,
            } as AssessmentResultRow;
        } else if (assessmentId === 'hexa-mind') {
            const { data, error } = await supabase
                .from('hexa_mind_results')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                // Se não encontrar, retorna null (não é erro crítico)
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('Erro ao buscar resultado do HexaMind:', error);
                return null;
            }

            if (!data) return null;

            // Converter para o formato AssessmentResultRow
            const result = convertHexaMindRowToAssessmentResult(data as any);
            return {
                id: (data as any).id,
                user_id: userId,
                assessment_id: 'hexa-mind',
                assessment_name: 'HexaMind',
                results: result.results,
                score: result.score || null,
                completed_at: result.completedAt.toISOString(),
                created_at: new Date((data as any).created_at).toISOString(),
                updated_at: (data as any).updated_at ? new Date((data as any).updated_at).toISOString() : null,
            } as AssessmentResultRow;
        }

        console.warn(`Tipo de avaliação não suportado: ${assessmentId}`);
        return null;
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
    result: HexaMindResult,
    authorization?: {
        authorizedForSuggestions?: boolean;
        authorizedToShowResults?: boolean;
        expiresAt?: Date;
    }
): Promise<any | null> {
    try {
        const supabase = createClient();

        // Calcular expires_at (padrão: 1 ano após completed_at se não fornecido)
        const expiresAt = authorization?.expiresAt
            ? authorization.expiresAt.toISOString()
            : new Date(result.completedAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

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
            authorized_for_suggestions: authorization?.authorizedForSuggestions ?? true,
            authorized_to_show_results: authorization?.authorizedToShowResults ?? false,
            expires_at: expiresAt,
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
        assessmentId: result.assessmentId,
        assessmentSlug: 'five-mind',
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
        assessmentId: result.assessmentId,
        assessmentSlug: 'hexa-mind',
        assessmentName: 'HexaMind',
        results: row.results as HexaMindResult['results'],
    };
}

/**
 * Atualiza apenas os campos de autorização do resultado mais recente de uma avaliação
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação ('five-mind' ou 'hexa-mind')
 * @param authorization - Dados de autorização
 * @returns Promise<boolean> - true se atualizado com sucesso
 */
export async function updateAssessmentAuthorization(
    userId: string,
    assessmentId: 'five-mind' | 'hexa-mind',
    authorization: {
        authorizedForSuggestions: boolean;
        authorizedToShowResults: boolean;
        expiresAt: Date;
    }
): Promise<boolean> {
    try {
        const supabase = createClient();

        // Buscar o registro mais recente do usuário para essa avaliação
        if (assessmentId === 'five-mind') {
            const { data: latestResult, error: fetchError } = await supabase
                .from('five_mind_results')
                .select('id')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (fetchError || !latestResult) {
                console.error(`❌ Erro ao buscar resultado mais recente de ${assessmentId}:`, fetchError);
                return false;
            }

            // Atualizar apenas os campos de autorização
            const updateData: any = {
                authorized_for_suggestions: authorization.authorizedForSuggestions,
                authorized_to_show_results: authorization.authorizedToShowResults,
                expires_at: authorization.expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            };
            const query = supabase.from('five_mind_results') as any;
            const { error: updateError } = await query
                .update(updateData)
                .eq('id', (latestResult as any).id);

            if (updateError) {
                console.error(`❌ Erro ao atualizar autorização de ${assessmentId}:`, updateError);
                return false;
            }

            console.log(`✅ Autorização de ${assessmentId} atualizada com sucesso`);
            return true;
        } else if (assessmentId === 'hexa-mind') {
            const { data: latestResult, error: fetchError } = await supabase
                .from('hexa_mind_results')
                .select('id')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (fetchError || !latestResult) {
                console.error(`❌ Erro ao buscar resultado mais recente de ${assessmentId}:`, fetchError);
                return false;
            }

            // Atualizar apenas os campos de autorização
            const updateData: any = {
                authorized_for_suggestions: authorization.authorizedForSuggestions,
                authorized_to_show_results: authorization.authorizedToShowResults,
                expires_at: authorization.expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            };
            const query = supabase.from('hexa_mind_results') as any;
            const { error: updateError } = await query
                .update(updateData)
                .eq('id', (latestResult as any).id);

            if (updateError) {
                console.error(`❌ Erro ao atualizar autorização de ${assessmentId}:`, updateError);
                return false;
            }

            console.log(`✅ Autorização de ${assessmentId} atualizada com sucesso`);
            return true;
        } else {
            console.error(`❌ Tipo de avaliação não suportado: ${assessmentId}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Erro ao atualizar autorização de ${assessmentId}:`, error);
        return false;
    }
}

