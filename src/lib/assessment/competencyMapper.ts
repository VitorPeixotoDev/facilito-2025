/**
 * Serviço para mapear traits de personalidade em competências sugeridas
 * 
 * Este serviço converte scores de avaliações (FiveMind/HexaMind) em
 * competências profissionais sugeridas para o perfil do usuário.
 */

/**
 * Mapeia scores do FiveMind para competências sugeridas
 */
export function mapFiveMindToCompetencies(scores: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
}): string[] {
    const suggestions: string[] = [];

    // Openness (Abertura à Experiência) - Score >= 4.0
    if (scores.openness >= 4.0) {
        suggestions.push('Criatividade e Inovação');
        suggestions.push('Adaptabilidade a Mudanças');
    }

    // Conscientiousness (Conscienciosidade) - Score >= 4.0
    if (scores.conscientiousness >= 4.0) {
        suggestions.push('Organização e Planejamento');
        suggestions.push('Foco em Resultados e Entrega');
        suggestions.push('Responsabilidade e Comprometimento');
    }

    // Extraversion (Extroversão) - Score >= 4.0
    if (scores.extraversion >= 4.0) {
        suggestions.push('Liderança e Influência');
        suggestions.push('Comunicação e Networking');
        suggestions.push('Trabalho em Equipe');
    }

    // Agreeableness (Amabilidade) - Score >= 4.0
    if (scores.agreeableness >= 4.0) {
        suggestions.push('Colaboração e Empatia');
        suggestions.push('Mediação de Conflitos');
        suggestions.push('Construção de Relacionamentos');
    }

    // Neuroticism (Estabilidade Emocional) - Score <= 2.0 (valores baixos = estabilidade)
    if (scores.neuroticism <= 2.0) {
        suggestions.push('Resiliência e Tolerância à Pressão');
        suggestions.push('Estabilidade Emocional');
        suggestions.push('Tomada de Decisão sob Estresse');
    }

    // Competências baseadas em combinações específicas

    // Alta Conscienciosidade + Alta Extroversão
    if (scores.conscientiousness >= 4.0 && scores.extraversion >= 4.0) {
        suggestions.push('Gestão de Projetos');
    }

    // Alta Abertura + Alta Conscienciosidade
    if (scores.openness >= 4.0 && scores.conscientiousness >= 4.0) {
        suggestions.push('Pensamento Estratégico');
        suggestions.push('Resolução de Problemas Complexos');
    }

    // Alta Estabilidade + Alta Amabilidade
    if (scores.neuroticism <= 2.0 && scores.agreeableness >= 4.0) {
        suggestions.push('Suporte e Mentoria');
    }

    // Remover duplicatas e limitar a 5 sugestões principais
    const uniqueSuggestions = Array.from(new Set(suggestions));
    return uniqueSuggestions.slice(0, 5);
}

/**
 * Mapeia scores do HexaMind para competências sugeridas
 */
export function mapHexaMindToCompetencies(scores: {
    honesty: number;
    emotional_stability: number;
    extraversion: number;
    agreeableness: number;
    conscientiousness: number;
    openness: number;
}): string[] {
    const suggestions: string[] = [];

    // Honesty (Honestidade/Humildade) - Score >= 4.0
    if (scores.honesty >= 4.0) {
        suggestions.push('Integridade e Ética Profissional');
        suggestions.push('Transparência e Confiabilidade');
    }

    // Emotional Stability (Estabilidade Emocional) - Score >= 4.0
    if (scores.emotional_stability >= 4.0) {
        suggestions.push('Resiliência e Tolerância à Pressão');
        suggestions.push('Equilíbrio Emocional');
        suggestions.push('Tomada de Decisão sob Estresse');
    }

    // Extraversion (Extroversão) - Score >= 4.0
    if (scores.extraversion >= 4.0) {
        suggestions.push('Liderança e Influência');
        suggestions.push('Comunicação e Networking');
        suggestions.push('Motivação de Equipes');
    }

    // Agreeableness (Amabilidade) - Score >= 4.0
    if (scores.agreeableness >= 4.0) {
        suggestions.push('Colaboração e Trabalho em Equipe');
        suggestions.push('Empatia e Inteligência Emocional');
    }

    // Conscientiousness (Conscienciosidade) - Score >= 4.0
    if (scores.conscientiousness >= 4.0) {
        suggestions.push('Organização e Planejamento');
        suggestions.push('Foco em Resultados e Entrega');
        suggestions.push('Disciplina e Persistência');
    }

    // Openness (Abertura à Experiência) - Score >= 4.0
    if (scores.openness >= 4.0) {
        suggestions.push('Criatividade e Inovação');
        suggestions.push('Aprendizado Contínuo');
        suggestions.push('Adaptabilidade');
    }

    // Competências baseadas em combinações específicas

    // Alta Honestidade + Alta Conscienciosidade
    if (scores.honesty >= 4.0 && scores.conscientiousness >= 4.0) {
        suggestions.push('Liderança Ética');
    }

    // Alta Estabilidade + Alta Conscienciosidade
    if (scores.emotional_stability >= 4.0 && scores.conscientiousness >= 4.0) {
        suggestions.push('Gestão de Projetos');
        suggestions.push('Execução Confiável');
    }

    // Alta Abertura + Alta Extroversão
    if (scores.openness >= 4.0 && scores.extraversion >= 4.0) {
        suggestions.push('Visão Estratégica');
        suggestions.push('Inovação e Empreendedorismo');
    }

    // Remover duplicatas e limitar a 5 sugestões principais
    const uniqueSuggestions = Array.from(new Set(suggestions));
    return uniqueSuggestions.slice(0, 5);
}

