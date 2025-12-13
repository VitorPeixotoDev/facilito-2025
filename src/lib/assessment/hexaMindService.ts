/**
 * Serviço específico para salvar resultados do HexaMind no banco de dados
 * 
 * Este serviço salva diretamente no banco, sem depender de localStorage.
 * Atualiza automaticamente users.analise_perfil através do trigger.
 */

import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import type { HexaMindResult } from '@/types/assessments';

/**
 * Obtém o ID do usuário autenticado diretamente do Supabase
 */
async function getAuthenticatedUserId(): Promise<string | null> {
    try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Erro ao obter sessão:', error);
            return null;
        }

        return session?.user?.id || null;
    } catch (error) {
        console.error('Erro ao obter userId:', error);
        return null;
    }
}

/**
 * Salva os resultados do HexaMind no banco de dados
 * 
 * @param userId - ID do usuário autenticado
 * @param result - Resultado do HexaMind
 * @returns Promise<boolean> - true se salvou com sucesso
 */
export async function saveHexaMindToDatabase(
    userId: string | null,
    result: HexaMindResult
): Promise<boolean> {
    try {
        // Se userId não foi fornecido, tentar obter da sessão
        let finalUserId = userId;
        if (!finalUserId) {
            console.log('⚠️ [HexaMind] userId não fornecido, buscando da sessão...');
            finalUserId = await getAuthenticatedUserId();
        }

        if (!finalUserId) {
            console.error('❌ [HexaMind] Não foi possível obter userId');
            return false;
        }

        console.log('🚀 [HexaMind] Iniciando salvamento no banco de dados');
        console.log('👤 User ID:', finalUserId);
        console.log('📊 Resultados:', result.results);

        const supabase = createClient();

        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            console.error('❌ [HexaMind] Usuário não autenticado na sessão');
            return false;
        }

        if (session.user.id !== finalUserId) {
            console.warn('⚠️ [HexaMind] userId fornecido não corresponde à sessão atual');
            finalUserId = session.user.id;
            console.log('🔄 [HexaMind] Usando userId da sessão:', finalUserId);
        }

        // 1. Salvar na tabela hexa_mind_results (tabela específica)
        console.log('📝 [HexaMind] Inserindo em hexa_mind_results...');
        const { data: hexaMindData, error: hexaMindError } = await supabase
            .from('hexa_mind_results')
            .insert({
                user_id: finalUserId,
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
            })
            .select()
            .single();

        if (hexaMindError) {
            console.error('❌ [HexaMind] Erro ao salvar em hexa_mind_results:', hexaMindError);
            console.error('Detalhes:', {
                message: hexaMindError.message,
                details: hexaMindError.details,
                hint: hexaMindError.hint,
                code: hexaMindError.code,
            });
            return false;
        }

        console.log('✅ [HexaMind] Salvo em hexa_mind_results:', hexaMindData);
        console.log('🔄 [HexaMind] Trigger deve atualizar users.analise_perfil automaticamente');

        // 2. Salvar também em assessment_results (compatibilidade)
        console.log('📝 [HexaMind] Inserindo em assessment_results...');
        const { data: assessmentData, error: assessmentError } = await supabase
            .from('assessment_results')
            .insert({
                user_id: finalUserId,
                assessment_id: result.assessmentId,
                assessment_name: result.assessmentName,
                results: result.results,
                score: result.results.overallScore || null,
                completed_at: result.completedAt.toISOString(),
            })
            .select()
            .single();

        if (assessmentError) {
            console.warn('⚠️ [HexaMind] Erro ao salvar em assessment_results (não crítico):', assessmentError);
            // Não retorna false aqui, pois o importante é hexa_mind_results
        } else {
            console.log('✅ [HexaMind] Salvo em assessment_results:', assessmentData);
        }

        // 3. Verificar se analise_perfil foi atualizado (aguardar um pouco para o trigger executar)
        setTimeout(async () => {
            const { data: userData } = await supabase
                .from('users')
                .select('analise_perfil')
                .eq('id', finalUserId)
                .single();

            if (userData?.analise_perfil) {
                console.log('✅ [HexaMind] users.analise_perfil atualizado:', userData.analise_perfil);
            } else {
                console.warn('⚠️ [HexaMind] users.analise_perfil ainda não foi atualizado');
            }
        }, 1000);

        return true;
    } catch (error) {
        console.error('❌ [HexaMind] Erro inesperado:', error);
        return false;
    }
}

/**
 * Busca o último resultado do HexaMind de um usuário
 * 
 * @param userId - ID do usuário
 * @returns Promise com o resultado ou null
 */
export async function getLatestHexaMindResult(userId: string): Promise<any | null> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('hexa_mind_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Erro ao buscar resultado do HexaMind:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar resultado do HexaMind:', error);
        return null;
    }
}

