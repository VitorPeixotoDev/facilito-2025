/**
 * Serviço para buscar detalhes completos das avaliações
 */

import { createClient } from '@/utils/supabase/client';
import { getLatestFiveMindResult } from './fiveMindService';
import { getLatestHexaMindResult } from './hexaMindService';

export interface AssessmentDetails {
    assessmentId: string;
    assessmentName: string;
    completedAt: Date;
    scores: Record<string, number>;
    overallScore?: number;
}

/**
 * Busca os detalhes completos de uma avaliação
 * 
 * @param userId - ID do usuário
 * @param assessmentId - ID da avaliação ('five-mind' ou 'hexa-mind')
 * @returns Promise com os detalhes da avaliação ou null
 */
export async function getAssessmentDetails(
    userId: string,
    assessmentId: string
): Promise<AssessmentDetails | null> {
    try {
        if (assessmentId === 'five-mind') {
            const result = await getLatestFiveMindResult(userId);
            if (!result) return null;

            return {
                assessmentId: 'five-mind',
                assessmentName: 'FiveMind',
                completedAt: new Date(result.completed_at),
                scores: {
                    openness: result.openness,
                    conscientiousness: result.conscientiousness,
                    extraversion: result.extraversion,
                    agreeableness: result.agreeableness,
                    neuroticism: result.neuroticism,
                },
                overallScore: result.overall_score || undefined,
            };
        } else if (assessmentId === 'hexa-mind') {
            const result = await getLatestHexaMindResult(userId);
            if (!result) return null;

            return {
                assessmentId: 'hexa-mind',
                assessmentName: 'HexaMind',
                completedAt: new Date(result.completed_at),
                scores: {
                    honesty: result.honesty,
                    emotional_stability: result.emotional_stability,
                    extraversion: result.extraversion,
                    agreeableness: result.agreeableness,
                    conscientiousness: result.conscientiousness,
                    openness: result.openness,
                    consistency: result.consistency,
                    responseConsistency: result.response_consistency,
                },
                overallScore: result.overall_score || undefined,
            };
        }

        return null;
    } catch (error) {
        console.error('Erro ao buscar detalhes da avaliação:', error);
        return null;
    }
}

