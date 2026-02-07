/**
 * Serviço para buscar todas as avaliações realizadas por um usuário
 */

import { createClient } from '@/utils/supabase/client';
import { getAssessmentById } from './assessmentsConfig';
import type { AssessmentConfig } from '@/types/assessments';

/** Busca id (UUID) por slug a partir da API (catálogo do banco). */
async function getAssessmentIdBySlugFromApi(slug: string): Promise<string | null> {
    const res = await fetch('/api/assessments');
    if (!res.ok) return null;
    const data = await res.json();
    const list = (data.assessments ?? []) as Array<{ id: string; slug: string }>;
    const found = list.find((a) => a.slug === slug);
    return found?.id ?? null;
}

export interface UserAssessment {
    assessmentId: string;
    assessmentConfig: AssessmentConfig;
    hasResult: boolean;
    completedAt?: Date;
}

/**
 * Busca todas as avaliações realizadas por um usuário
 * Verifica diretamente nas tabelas específicas (five_mind_results e hexa_mind_results)
 * 
 * @param userId - ID do usuário
 * @returns Promise com array de avaliações realizadas
 */
export async function getUserAssessments(userId: string): Promise<UserAssessment[]> {
    try {
        const supabase = createClient();
        const assessments: UserAssessment[] = [];
        const idBySlug = await getAssessmentIdsBySlugFromApi();
        const fiveMindId = idBySlug['five-mind'] ?? null;
        const hexaMindId = idBySlug['hexa-mind'] ?? null;

        // Verifica FiveMind
        const { data: fiveMindData, error: fiveMindError } = await supabase
            .from('five_mind_results')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!fiveMindError && fiveMindData && fiveMindId) {
            const config = getAssessmentById('five-mind');
            if (config) {
                assessments.push({
                    assessmentId: fiveMindId,
                    assessmentConfig: config,
                    hasResult: true,
                    completedAt: new Date((fiveMindData as any).completed_at),
                });
            }
        }

        // Verifica HexaMind
        const { data: hexaMindData, error: hexaMindError } = await supabase
            .from('hexa_mind_results')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!hexaMindError && hexaMindData && hexaMindId) {
            const config = getAssessmentById('hexa-mind');
            if (config) {
                assessments.push({
                    assessmentId: hexaMindId,
                    assessmentConfig: config,
                    hasResult: true,
                    completedAt: new Date((hexaMindData as any).completed_at),
                });
            }
        }

        // Ordena por data de conclusão (mais recente primeiro)
        return assessments.sort((a, b) => {
            if (!a.completedAt) return 1;
            if (!b.completedAt) return -1;
            return b.completedAt.getTime() - a.completedAt.getTime();
        });
    } catch (error) {
        console.error('Erro ao buscar avaliações do usuário:', error);
        return [];
    }
}

/**
 * Busca a análise predominante de uma avaliação específica
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação
 * @returns Promise com a análise predominante ou null
 */
/**
 * @param slug - Slug da avaliação ('five-mind' | 'hexa-mind'), vindo da API/banco
 */
export async function getPredominantAnalysisForAssessment(
    userId: string,
    slug: string
): Promise<string | null> {
    try {
        const supabase = createClient();

        if (slug === 'five-mind') {
            const { data, error } = await supabase
                .from('five_mind_results')
                .select('openness, conscientiousness, extraversion, agreeableness, neuroticism')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error || !data) return null;

            const result = data as any;

            // Encontra o score mais alto
            const scores = {
                'Abertura à Experiências:': result.openness,
                'Conscienciosidade:': result.conscientiousness,
                'Extroversão:': result.extraversion,
                'Amabilidade:': result.agreeableness,
                'Estabilidade Emocional:': result.neuroticism, // Para neuroticism, valores baixos são positivos
            };

            // Para neuroticism, inverte a lógica (valores baixos = alta estabilidade)
            const adjustedScores = {
                'Abertura à Experiências:': scores['Abertura à Experiências:'],
                'Conscienciosidade:': scores['Conscienciosidade:'],
                'Extroversão:': scores['Extroversão:'],
                'Amabilidade:': scores['Amabilidade:'],
                'Estabilidade Emocional:': 6 - scores['Estabilidade Emocional:'], // Inverte (5.0 vira 1.0, 1.0 vira 5.0)
            };

            const maxEntry = Object.entries(adjustedScores).reduce((max, [key, value]) => {
                return value > max[1] ? [key, value] : max;
            }, ['', 0]);

            // Remove os dois pontos do final
            return maxEntry[0] ? maxEntry[0].replace(':', '').trim() : null;
        } else if (slug === 'hexa-mind') {
            const { data, error } = await supabase
                .from('hexa_mind_results')
                .select('honesty, emotional_stability, extraversion, agreeableness, conscientiousness, openness')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error || !data) return null;

            const result = data as any;

            // Encontra o score mais alto
            const scores = {
                'Honestidade:': result.honesty,
                'Estabilidade Emocional:': result.emotional_stability,
                'Extroversão:': result.extraversion,
                'Amabilidade:': result.agreeableness,
                'Conscienciosidade:': result.conscientiousness,
                'Abertura à Experiências:': result.openness,
            };

            const maxEntry = Object.entries(scores).reduce((max, [key, value]) => {
                return value > max[1] ? [key, value] : max;
            }, ['', 0]);

            // Remove os dois pontos do final
            return maxEntry[0] ? maxEntry[0].replace(':', '').trim() : null;
        }

        return null;
    } catch (error) {
        console.error('Erro ao buscar análise predominante:', error);
        return null;
    }
}

