/**
 * Funções auxiliares para mapear profile_analysis para assessments
 */

import { ASSESSMENTS_CONFIG, getAssessmentById } from './assessmentsConfig';

/**
 * Mapeia uma string de profile_analysis para o ID do assessment correspondente
 * 
 * @param analysisString - String de análise do perfil (ex: "Abertura à Experiências: ...")
 * @param allAnalysis - Array completo de análises para contexto
 * @returns ID do assessment ('five-mind' ou 'hexa-mind') ou null
 */
export function mapAnalysisToAssessmentId(
    analysisString: string,
    allAnalysis: string[]
): string | null {
    // HexaMind tem "Honestidade" que é único
    const hasHonesty = allAnalysis.some(a => a.startsWith('Honestidade:'));

    if (hasHonesty) {
        // Se tem Honestidade, é HexaMind
        return 'hexa-mind';
    }

    // Caso contrário, verifica se tem características do FiveMind
    const fiveMindIndicators = [
        'Abertura à Experiências:',
        'Conscienciosidade:',
        'Extroversão:',
        'Amabilidade:',
        'Estabilidade Emocional:'
    ];

    const hasFiveMindIndicator = fiveMindIndicators.some(indicator =>
        analysisString.startsWith(indicator)
    );

    if (hasFiveMindIndicator) {
        return 'five-mind';
    }

    return null;
}

/**
 * Agrupa análises por assessment
 * 
 * @param profileAnalysis - Array de strings de análise do perfil
 * @returns Objeto com análises agrupadas por assessment ID
 */
export function groupAnalysisByAssessment(profileAnalysis: string[] | null): Record<string, string[]> {
    if (!profileAnalysis || profileAnalysis.length === 0) {
        return {};
    }

    const grouped: Record<string, string[]> = {};

    // Verifica se há HexaMind (tem "Honestidade" que é único)
    const hasHexaMind = profileAnalysis.some(a => a.startsWith('Honestidade:'));

    // Características comuns a ambos
    const commonIndicators = [
        'Abertura à Experiências:',
        'Conscienciosidade:',
        'Extroversão:',
        'Amabilidade:',
        'Estabilidade Emocional:'
    ];

    // Agrupa análises
    // Estratégia: Se há "Honestidade:", todas as análises são HexaMind
    // Se não há "Honestidade:", todas são FiveMind
    // Isso funciona porque o trigger substitui completamente o array quando um novo resultado é salvo
    profileAnalysis.forEach(analysis => {
        let assessmentId: string | null = null;

        // Se tem "Honestidade:", é definitivamente HexaMind
        if (analysis.startsWith('Honestidade:')) {
            assessmentId = 'hexa-mind';
        }
        // Se há HexaMind no array, assume que todas as características comuns são HexaMind
        else if (hasHexaMind && commonIndicators.some(indicator => analysis.startsWith(indicator))) {
            assessmentId = 'hexa-mind';
        }
        // Se não tem HexaMind, assume FiveMind
        else if (!hasHexaMind && commonIndicators.some(indicator => analysis.startsWith(indicator))) {
            assessmentId = 'five-mind';
        }

        if (assessmentId) {
            if (!grouped[assessmentId]) {
                grouped[assessmentId] = [];
            }
            grouped[assessmentId].push(analysis);
        }
    });

    return grouped;
}


