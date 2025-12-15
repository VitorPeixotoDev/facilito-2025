-- ============================================================================
-- MIGRATION: Adicionar prefixos aos resultados de avaliações no profile_analysis
-- ============================================================================
--
-- Esta migração modifica os triggers SQL para:
-- 1. Adicionar prefixos "five_mind_result -> " e "hexa_mind_result -> "
--    a cada entrada do array profile_analysis
-- 2. Mesclar resultados em vez de substituir (preserva avaliações anteriores)
--
-- IMPORTANTE: Esta migração NÃO atualiza dados existentes, apenas modifica
-- os triggers para aplicar prefixos em novos dados salvos a partir deste momento.
-- ============================================================================

-- ============================================================================
-- FUNÇÃO: update_user_analise_perfil_from_fivemind_results (MODIFICADA)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_analise_perfil_from_fivemind_results()
RETURNS TRIGGER AS $$
DECLARE
    new_analise_perfil text[] := '{}';
    prefix text := 'five_mind_result -> ';
BEGIN
    -- NOVA LÓGICA: Substituir completamente todas as análises anteriores
    -- Cada novo teste substitui todos os testes anteriores (não mescla)
    -- Isso evita acúmulo de vantagem por fazer múltiplos testes
    -- existing_analise_perfil será sempre um array vazio, iniciando do zero

    -- Openness (Abertura à Experiência)
    IF NEW.openness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias');
    ELSIF NEW.openness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Criatividade, curiosidade e abertura a novas ideias');
    ELSIF NEW.openness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Abertura moderada a experiências novas');
    ELSIF NEW.openness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Preferência por rotinas e estabilidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Forte preferência por rotinas, pouca abertura a mudanças');
    END IF;

    -- Conscientiousness (Conscienciosidade)
    IF NEW.conscientiousness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Muito alta organização, disciplina exemplar e extrema responsabilidade');
    ELSIF NEW.conscientiousness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Organização, disciplina e responsabilidade');
    ELSIF NEW.conscientiousness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Nível moderado de organização e planejamento');
    ELSIF NEW.conscientiousness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Preferência por flexibilidade e espontaneidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Alta flexibilidade, baixa necessidade de estrutura');
    END IF;

    -- Extraversion (Extroversão)
    IF NEW.extraversion >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Muito alta sociabilidade, assertividade elevada e energia intensa');
    ELSIF NEW.extraversion >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Sociabilidade, assertividade e energia');
    ELSIF NEW.extraversion >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Equilíbrio entre sociabilidade e momentos de introspecção');
    ELSIF NEW.extraversion >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Preferência por ambientes mais reservados e grupos pequenos');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Alto nível de introversão, prefere atividades solitárias');
    END IF;

    -- Agreeableness (Amabilidade)
    IF NEW.agreeableness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Muito alta empatia, cooperação exemplar e grande confiança nos outros');
    ELSIF NEW.agreeableness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Empatia, cooperação e confiança');
    ELSIF NEW.agreeableness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Nível moderado de empatia e disposição para colaborar');
    ELSIF NEW.agreeableness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Tendência a ser mais direto e menos complacente');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Alta assertividade, preferência por competição sobre cooperação');
    END IF;

    -- Neuroticism (Estabilidade Emocional) - Valores BAIXOS = Estabilidade
    IF NEW.neuroticism <= 1.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Muito alta resiliência, extrema calma e excelente controle emocional');
    ELSIF NEW.neuroticism <= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Resiliência, calma e controle emocional');
    ELSIF NEW.neuroticism <= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Reatividade emocional moderada');
    ELSIF NEW.neuroticism <= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Maior sensibilidade emocional e reatividade ao estresse');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Alta sensibilidade emocional, necessidade de apoio em situações estressantes');
    END IF;

    -- NOVA LÓGICA: Não mesclar, substituir completamente
    -- new_analise_perfil já contém apenas as novas análises do FiveMind

    -- Atualizar profile_analysis do usuário
    UPDATE public.users
    SET profile_analysis = new_analise_perfil,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: update_user_analise_perfil_from_hexamind_results (MODIFICADA)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_analise_perfil_from_hexamind_results()
RETURNS TRIGGER AS $$
DECLARE
    new_analise_perfil text[] := '{}';
    prefix text := 'hexa_mind_result -> ';
BEGIN
    -- NOVA LÓGICA: Substituir completamente todas as análises anteriores
    -- Cada novo teste substitui todos os testes anteriores (não mescla)
    -- Isso evita acúmulo de vantagem por fazer múltiplos testes
    -- existing_analise_perfil será sempre um array vazio, iniciando do zero

    -- Honesty (Honestidade/Humildade)
    IF NEW.honesty >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Honestidade: Muito alta integridade, transparência exemplar e grande humildade');
    ELSIF NEW.honesty >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Honestidade: Integridade, transparência e humildade');
    ELSIF NEW.honesty >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Honestidade: Nível moderado de integridade e transparência');
    ELSIF NEW.honesty >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Honestidade: Tendência a ser mais assertivo e menos complacente');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Honestidade: Alta assertividade, preferência por competição');
    END IF;

    -- Emotional Stability (Estabilidade Emocional)
    IF NEW.emotional_stability >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Muito alta resiliência, extrema calma e excelente controle emocional');
    ELSIF NEW.emotional_stability >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Resiliência, calma e controle emocional');
    ELSIF NEW.emotional_stability >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Reatividade emocional moderada');
    ELSIF NEW.emotional_stability >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Maior sensibilidade emocional e reatividade ao estresse');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Estabilidade Emocional: Alta sensibilidade emocional, necessidade de apoio em situações estressantes');
    END IF;

    -- Extraversion (Extroversão)
    IF NEW.extraversion >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Muito alta sociabilidade, assertividade elevada e energia intensa');
    ELSIF NEW.extraversion >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Sociabilidade, assertividade e energia');
    ELSIF NEW.extraversion >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Equilíbrio entre sociabilidade e momentos de introspecção');
    ELSIF NEW.extraversion >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Preferência por ambientes mais reservados e grupos pequenos');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Extroversão: Alto nível de introversão, prefere atividades solitárias');
    END IF;

    -- Agreeableness (Amabilidade)
    IF NEW.agreeableness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Muito alta empatia, cooperação exemplar e grande confiança nos outros');
    ELSIF NEW.agreeableness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Empatia, cooperação e confiança');
    ELSIF NEW.agreeableness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Nível moderado de empatia e disposição para colaborar');
    ELSIF NEW.agreeableness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Tendência a ser mais direto e menos complacente');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Amabilidade: Alta assertividade, preferência por competição sobre cooperação');
    END IF;

    -- Conscientiousness (Conscienciosidade)
    IF NEW.conscientiousness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Muito alta organização, disciplina exemplar e extrema responsabilidade');
    ELSIF NEW.conscientiousness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Organização, disciplina e responsabilidade');
    ELSIF NEW.conscientiousness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Nível moderado de organização e planejamento');
    ELSIF NEW.conscientiousness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Preferência por flexibilidade e espontaneidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Conscienciosidade: Alta flexibilidade, baixa necessidade de estrutura');
    END IF;

    -- Openness (Abertura à Experiência)
    IF NEW.openness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias');
    ELSIF NEW.openness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Criatividade, curiosidade e abertura a novas ideias');
    ELSIF NEW.openness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Abertura moderada a experiências novas');
    ELSIF NEW.openness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Preferência por rotinas e estabilidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            prefix || 'Abertura à Experiências: Forte preferência por rotinas, pouca abertura a mudanças');
    END IF;

    -- NOVA LÓGICA: Não mesclar, substituir completamente
    -- new_analise_perfil já contém apenas as novas análises do HexaMind

    -- Atualizar profile_analysis do usuário
    UPDATE public.users
    SET profile_analysis = new_analise_perfil,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;