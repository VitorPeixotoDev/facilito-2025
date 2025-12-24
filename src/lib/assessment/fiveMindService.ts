/**
 * Serviço específico para salvar resultados do FiveMind no banco de dados
 * 
 * Este serviço salva diretamente no banco, sem depender de localStorage.
 * Atualiza automaticamente users.analise_perfil através do trigger.
 */

import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import type { FiveMindResult } from '@/types/assessments';

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
 * Salva os resultados do FiveMind no banco de dados
 * 
 * @param userId - ID do usuário autenticado
 * @param result - Resultado do FiveMind
 * @param authorization - Dados de autorização (opcional)
 * @returns Promise<boolean> - true se salvou com sucesso
 */
export async function saveFiveMindToDatabase(
    userId: string | null,
    result: FiveMindResult,
    authorization?: {
        authorizedForSuggestions?: boolean;
        authorizedToShowResults?: boolean;
        expiresAt?: Date;
    }
): Promise<boolean> {
    try {
        // Se userId não foi fornecido, tentar obter da sessão
        let finalUserId = userId;
        if (!finalUserId) {
            console.log('⚠️ [FiveMind] userId não fornecido, buscando da sessão...');
            finalUserId = await getAuthenticatedUserId();
        }

        if (!finalUserId) {
            console.error('❌ [FiveMind] Não foi possível obter userId');
            return false;
        }

        console.log('🚀 [FiveMind] Iniciando salvamento no banco de dados');
        console.log('👤 User ID:', finalUserId);
        console.log('📊 Resultados:', result.results);

        const supabase = createClient();

        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            console.error('❌ [FiveMind] Usuário não autenticado na sessão');
            return false;
        }

        if (session.user.id !== finalUserId) {
            console.warn('⚠️ [FiveMind] userId fornecido não corresponde à sessão atual');
            finalUserId = session.user.id;
            console.log('🔄 [FiveMind] Usando userId da sessão:', finalUserId);
        }

        // Calcular expires_at (padrão: 1 ano após completed_at se não fornecido)
        const expiresAt = authorization?.expiresAt 
            ? authorization.expiresAt.toISOString()
            : new Date(result.completedAt.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Salvar na tabela five_mind_results (tabela específica)
        console.log('📝 [FiveMind] Inserindo em five_mind_results...');
        const { data: fiveMindData, error: fiveMindError } = await supabase
            .from('five_mind_results')
            .insert({
                user_id: finalUserId,
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
            })
            .select()
            .single();

        if (fiveMindError) {
            console.error('❌ [FiveMind] Erro ao salvar em five_mind_results:', fiveMindError);
            console.error('Detalhes:', {
                message: fiveMindError.message,
                details: fiveMindError.details,
                hint: fiveMindError.hint,
                code: fiveMindError.code,
            });
            return false;
        }

        console.log('✅ [FiveMind] Salvo em five_mind_results:', fiveMindData);
        console.log('🔄 [FiveMind] Trigger deve atualizar users.analise_perfil automaticamente');

        // 2. Salvar também em assessment_results (compatibilidade)
        console.log('📝 [FiveMind] Inserindo em assessment_results...');
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
            console.warn('⚠️ [FiveMind] Erro ao salvar em assessment_results (não crítico):', assessmentError);
            // Não retorna false aqui, pois o importante é five_mind_results
        } else {
            console.log('✅ [FiveMind] Salvo em assessment_results:', assessmentData);
        }

        // 3. Verificar se analise_perfil foi atualizado (aguardar um pouco para o trigger executar)
        setTimeout(async () => {
            const { data: userData } = await supabase
                .from('users')
                .select('analise_perfil')
                .eq('id', finalUserId)
                .single();

            if (userData?.analise_perfil) {
                console.log('✅ [FiveMind] users.analise_perfil atualizado:', userData.analise_perfil);
            } else {
                console.warn('⚠️ [FiveMind] users.analise_perfil ainda não foi atualizado');
            }
        }, 1000);

        return true;
    } catch (error) {
        console.error('❌ [FiveMind] Erro inesperado:', error);
        return false;
    }
}

/**
 * Busca o último resultado do FiveMind de um usuário
 * 
 * @param userId - ID do usuário
 * @returns Promise com o resultado ou null
 */
export async function getLatestFiveMindResult(userId: string): Promise<any | null> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('five_mind_results')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error('Erro ao buscar resultado do FiveMind:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Erro ao buscar resultado do FiveMind:', error);
        return null;
    }
}

