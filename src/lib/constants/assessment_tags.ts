/**
 * Categorias principais de avaliações (Assessment Tags)
 * usadas na loja de avaliações e no sistema de recomendações.
 */

export const MAIN_ASSESSMENT_TAGS: string[] = [
    'Fit Cultural',
    'Cultural Add',
    'Soft Skills e Competências',
    'Testes de Personalidade (Big Five/IPIP)',
    'Mapeamento Comportamental (DISC)',
    'Integridade e Ética Profissional',
    'Avaliação de Potencial e Liderança',
    'Testes de Raciocínio e Cognitivos',
    'Assessment Center e Simulações',
    'Avaliação de Valores e Motivação',
    'Saúde Psicológica e Bem-estar',
    'Competências Técnicas e Especializadas',
    'Análise de Perfil Motivacional',
    'Testes de Estilo de Tomada de Decisão',
    'Avaliação de Resiliência e Adaptabilidade',
    'Dinâmica de Grupo e Colaboração',
    'Feedback 360° e Avaliação por Pares',
];

export type AssessmentTag = (typeof MAIN_ASSESSMENT_TAGS)[number];

/**
 * Mapeia cada tag para os IDs de avaliações disponíveis.
 *
 * Por enquanto, apenas "Fit Cultural" possui avaliações (FiveMind e HexaMind).
 * As demais entrarão conforme novos testes forem adicionados.
 */
export const TAG_ASSESSMENTS_MAP: Record<AssessmentTag, string[]> = {
    'Fit Cultural': ['five-mind', 'hexa-mind'],
    'Cultural Add': [],
    'Soft Skills e Competências': [],
    'Testes de Personalidade (Big Five/IPIP)': [],
    'Mapeamento Comportamental (DISC)': [],
    'Integridade e Ética Profissional': [],
    'Avaliação de Potencial e Liderança': [],
    'Testes de Raciocínio e Cognitivos': [],
    'Assessment Center e Simulações': [],
    'Avaliação de Valores e Motivação': [],
    'Saúde Psicológica e Bem-estar': [],
    'Competências Técnicas e Especializadas': [],
    'Análise de Perfil Motivacional': [],
    'Testes de Estilo de Tomada de Decisão': [],
    'Avaliação de Resiliência e Adaptabilidade': [],
    'Dinâmica de Grupo e Colaboração': [],
    'Feedback 360° e Avaliação por Pares': [],
};
