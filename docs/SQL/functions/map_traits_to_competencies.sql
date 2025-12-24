-- ============================================================================
-- Função SQL para mapear traits de personalidade em competências sugeridas
-- 
-- Esta função recebe os scores de uma avaliação (FiveMind ou HexaMind)
-- e retorna um array de competências sugeridas baseadas em regras de negócio.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.map_fivemind_to_competencies(
    openness numeric,
    conscientiousness numeric,
    extraversion numeric,
    agreeableness numeric,
    neuroticism numeric
)
RETURNS text[] AS $$
DECLARE
    suggestions text[] := '{}';
BEGIN
    -- Mapeamento baseado em scores altos de cada trait
    
    -- Openness (Abertura à Experiência) - Score >= 4.0
    IF openness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Criatividade e Inovação');
        suggestions := array_append(suggestions, 'Adaptabilidade a Mudanças');
    END IF;
    
    -- Conscientiousness (Conscienciosidade) - Score >= 4.0
    IF conscientiousness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Organização e Planejamento');
        suggestions := array_append(suggestions, 'Foco em Resultados e Entrega');
        suggestions := array_append(suggestions, 'Responsabilidade e Comprometimento');
    END IF;
    
    -- Extraversion (Extroversão) - Score >= 4.0
    IF extraversion >= 4.0 THEN
        suggestions := array_append(suggestions, 'Liderança e Influência');
        suggestions := array_append(suggestions, 'Comunicação e Networking');
        suggestions := array_append(suggestions, 'Trabalho em Equipe');
    END IF;
    
    -- Agreeableness (Amabilidade) - Score >= 4.0
    IF agreeableness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Colaboração e Empatia');
        suggestions := array_append(suggestions, 'Mediação de Conflitos');
        suggestions := array_append(suggestions, 'Construção de Relacionamentos');
    END IF;
    
    -- Neuroticism (Estabilidade Emocional) - Score <= 2.0 (valores baixos = estabilidade)
    IF neuroticism <= 2.0 THEN
        suggestions := array_append(suggestions, 'Resiliência e Tolerância à Pressão');
        suggestions := array_append(suggestions, 'Estabilidade Emocional');
        suggestions := array_append(suggestions, 'Tomada de Decisão sob Estresse');
    END IF;
    
    -- Competências baseadas em combinações específicas
    
    -- Alta Conscienciosidade + Alta Extroversão
    IF conscientiousness >= 4.0 AND extraversion >= 4.0 THEN
        suggestions := array_append(suggestions, 'Gestão de Projetos');
    END IF;
    
    -- Alta Abertura + Alta Conscienciosidade
    IF openness >= 4.0 AND conscientiousness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Pensamento Estratégico');
        suggestions := array_append(suggestions, 'Resolução de Problemas Complexos');
    END IF;
    
    -- Alta Estabilidade + Alta Amabilidade
    IF neuroticism <= 2.0 AND agreeableness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Suporte e Mentoria');
    END IF;
    
    -- Remover duplicatas e limitar a 5 sugestões principais
    suggestions := (
        SELECT array_agg(DISTINCT s ORDER BY s)
        FROM unnest(suggestions) s
        LIMIT 5
    );
    
    RETURN COALESCE(suggestions, '{}');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Função para HexaMind
-- ============================================================================

CREATE OR REPLACE FUNCTION public.map_hexamind_to_competencies(
    honesty numeric,
    emotional_stability numeric,
    extraversion numeric,
    agreeableness numeric,
    conscientiousness numeric,
    openness numeric
)
RETURNS text[] AS $$
DECLARE
    suggestions text[] := '{}';
BEGIN
    -- Mapeamento baseado em scores altos de cada trait
    
    -- Honesty (Honestidade/Humildade) - Score >= 4.0
    IF honesty >= 4.0 THEN
        suggestions := array_append(suggestions, 'Integridade e Ética Profissional');
        suggestions := array_append(suggestions, 'Transparência e Confiabilidade');
    END IF;
    
    -- Emotional Stability (Estabilidade Emocional) - Score >= 4.0
    IF emotional_stability >= 4.0 THEN
        suggestions := array_append(suggestions, 'Resiliência e Tolerância à Pressão');
        suggestions := array_append(suggestions, 'Equilíbrio Emocional');
        suggestions := array_append(suggestions, 'Tomada de Decisão sob Estresse');
    END IF;
    
    -- Extraversion (Extroversão) - Score >= 4.0
    IF extraversion >= 4.0 THEN
        suggestions := array_append(suggestions, 'Liderança e Influência');
        suggestions := array_append(suggestions, 'Comunicação e Networking');
        suggestions := array_append(suggestions, 'Motivação de Equipes');
    END IF;
    
    -- Agreeableness (Amabilidade) - Score >= 4.0
    IF agreeableness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Colaboração e Trabalho em Equipe');
        suggestions := array_append(suggestions, 'Empatia e Inteligência Emocional');
    END IF;
    
    -- Conscientiousness (Conscienciosidade) - Score >= 4.0
    IF conscientiousness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Organização e Planejamento');
        suggestions := array_append(suggestions, 'Foco em Resultados e Entrega');
        suggestions := array_append(suggestions, 'Disciplina e Persistência');
    END IF;
    
    -- Openness (Abertura à Experiência) - Score >= 4.0
    IF openness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Criatividade e Inovação');
        suggestions := array_append(suggestions, 'Aprendizado Contínuo');
        suggestions := array_append(suggestions, 'Adaptabilidade');
    END IF;
    
    -- Competências baseadas em combinações específicas
    
    -- Alta Honestidade + Alta Conscienciosidade
    IF honesty >= 4.0 AND conscientiousness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Liderança Ética');
    END IF;
    
    -- Alta Estabilidade + Alta Conscienciosidade
    IF emotional_stability >= 4.0 AND conscientiousness >= 4.0 THEN
        suggestions := array_append(suggestions, 'Gestão de Projetos');
        suggestions := array_append(suggestions, 'Execução Confiável');
    END IF;
    
    -- Alta Abertura + Alta Extroversão
    IF openness >= 4.0 AND extraversion >= 4.0 THEN
        suggestions := array_append(suggestions, 'Visão Estratégica');
        suggestions := array_append(suggestions, 'Inovação e Empreendedorismo');
    END IF;
    
    -- Remover duplicatas e limitar a 5 sugestões principais
    suggestions := (
        SELECT array_agg(DISTINCT s ORDER BY s)
        FROM unnest(suggestions) s
        LIMIT 5
    );
    
    RETURN COALESCE(suggestions, '{}');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- COMENTÁRIOS DAS FUNÇÕES
-- ============================================================================

COMMENT ON FUNCTION public.map_fivemind_to_competencies IS 
    'Mapeia scores do FiveMind (Big Five) para competências sugeridas baseadas em regras de negócio';

COMMENT ON FUNCTION public.map_hexamind_to_competencies IS 
    'Mapeia scores do HexaMind (6 Fatores) para competências sugeridas baseadas em regras de negócio';

