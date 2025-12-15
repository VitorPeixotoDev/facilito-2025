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
 * Extrai IDs de avaliações do array profile_analysis usando prefixos
 * 
 * Agora que os triggers SQL adicionam prefixos "five_mind_result -> " e 
 * "hexa_mind_result -> " a cada entrada, podemos identificar diretamente
 * quais avaliações foram completadas.
 * 
 * IMPORTANTE: Com a nova lógica, apenas UMA avaliação deve existir por vez
 * (a última realizada substitui todas as anteriores).
 * 
 * @param profileAnalysis - Array de strings de análise do perfil com prefixos
 * @returns Array de IDs de avaliações encontradas ('five-mind', 'hexa-mind')
 */
export function extractAssessmentIds(profileAnalysis: string[] | null): string[] {
    if (!profileAnalysis || profileAnalysis.length === 0) {
        return [];
    }

    const assessmentIds = new Set<string>();

    profileAnalysis.forEach(analysis => {
        if (analysis.startsWith('five_mind_result -> ')) {
            assessmentIds.add('five-mind');
        } else if (analysis.startsWith('hexa_mind_result -> ')) {
            assessmentIds.add('hexa-mind');
        }
    });

    return Array.from(assessmentIds);
}

/**
 * Gets the most recent assessment ID from profile_analysis
 * 
 * With the new logic, only one assessment should exist at a time.
 * This function returns the first assessment found (which should be the only one).
 * 
 * @param profileAnalysis - Array of profile analysis strings
 * @returns Assessment ID or null if none found
 */
export function getLatestAssessmentId(profileAnalysis: string[] | null): string | null {
    const ids = extractAssessmentIds(profileAnalysis);
    return ids.length > 0 ? ids[0] : null;
}

/**
 * Agrupa análises por assessment
 * 
 * @param profileAnalysis - Array de strings de análise do perfil
 * @returns Objeto com análises agrupadas por assessment ID
 * 
 * @deprecated Esta função mantida para compatibilidade, mas agora usa extractAssessmentIds
 * que é mais preciso com os prefixos. Preferir usar extractAssessmentIds diretamente.
 */
export function groupAnalysisByAssessment(profileAnalysis: string[] | null): Record<string, string[]> {
    if (!profileAnalysis || profileAnalysis.length === 0) {
        return {};
    }

    const grouped: Record<string, string[]> = {};

    // Primeiro, tentar usar os prefixos (abordagem nova e mais precisa)
    const assessmentIds = extractAssessmentIds(profileAnalysis);

    if (assessmentIds.length > 0) {
        // Se temos prefixos, agrupar por prefixo
        profileAnalysis.forEach(analysis => {
            if (analysis.startsWith('five_mind_result -> ')) {
                if (!grouped['five-mind']) {
                    grouped['five-mind'] = [];
                }
                // Remove o prefixo para manter compatibilidade
                grouped['five-mind'].push(analysis.replace('five_mind_result -> ', ''));
            } else if (analysis.startsWith('hexa_mind_result -> ')) {
                if (!grouped['hexa-mind']) {
                    grouped['hexa-mind'] = [];
                }
                // Remove o prefixo para manter compatibilidade
                grouped['hexa-mind'].push(analysis.replace('hexa_mind_result -> ', ''));
            }
        });
        return grouped;
    }

    // Fallback: lógica antiga para dados sem prefixos (retrocompatibilidade)
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

    // Agrupa análises usando inferência (lógica antiga)
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


