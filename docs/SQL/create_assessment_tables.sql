-- Script SQL para criação das tabelas de resultados de avaliações
-- Este script cria as tabelas five_mind_results e hexa_mind_results com todas as constraints,
-- índices, triggers e políticas RLS necessárias

-- ============================================================================
-- TABELA: five_mind_results
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.five_mind_results (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    openness numeric(3, 1) NOT NULL,
    conscientiousness numeric(3, 1) NOT NULL,
    extraversion numeric(3, 1) NOT NULL,
    agreeableness numeric(3, 1) NOT NULL,
    neuroticism numeric(3, 1) NOT NULL,
    overall_score numeric(4, 2) NULL,
    completed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT five_mind_results_pkey PRIMARY KEY (id),
    CONSTRAINT five_mind_results_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT five_mind_results_openness_check CHECK (
        (openness >= 1.0) AND (openness <= 5.0)
    ),
    CONSTRAINT five_mind_results_conscientiousness_check CHECK (
        (conscientiousness >= 1.0) AND (conscientiousness <= 5.0)
    ),
    CONSTRAINT five_mind_results_extraversion_check CHECK (
        (extraversion >= 1.0) AND (extraversion <= 5.0)
    ),
    CONSTRAINT five_mind_results_agreeableness_check CHECK (
        (agreeableness >= 1.0) AND (agreeableness <= 5.0)
    ),
    CONSTRAINT five_mind_results_neuroticism_check CHECK (
        (neuroticism >= 1.0) AND (neuroticism <= 5.0)
    )
) TABLESPACE pg_default;

-- Índices para five_mind_results
CREATE INDEX IF NOT EXISTS idx_five_mind_results_user_id ON public.five_mind_results USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_five_mind_results_completed_at ON public.five_mind_results USING btree (completed_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_five_mind_results_user_completed ON public.five_mind_results USING btree (user_id, completed_at DESC) TABLESPACE pg_default;

-- ============================================================================
-- TABELA: hexa_mind_results
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hexa_mind_results (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    honesty numeric(3, 1) NOT NULL,
    emotional_stability numeric(3, 1) NOT NULL,
    extraversion numeric(3, 1) NOT NULL,
    agreeableness numeric(3, 1) NOT NULL,
    conscientiousness numeric(3, 1) NOT NULL,
    openness numeric(3, 1) NOT NULL,
    consistency numeric(3, 1) NOT NULL,
    response_consistency integer NOT NULL,
    overall_score numeric(4, 2) NULL,
    completed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT hexa_mind_results_pkey PRIMARY KEY (id),
    CONSTRAINT hexa_mind_results_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT hexa_mind_results_honesty_check CHECK (
        (honesty >= 1.0) AND (honesty <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_emotional_stability_check CHECK (
        (emotional_stability >= 1.0) AND (emotional_stability <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_extraversion_check CHECK (
        (extraversion >= 1.0) AND (extraversion <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_agreeableness_check CHECK (
        (agreeableness >= 1.0) AND (agreeableness <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_conscientiousness_check CHECK (
        (conscientiousness >= 1.0) AND (conscientiousness <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_openness_check CHECK (
        (openness >= 1.0) AND (openness <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_consistency_check CHECK (
        (consistency >= 1.0) AND (consistency <= 5.0)
    ),
    CONSTRAINT hexa_mind_results_response_consistency_check CHECK (
        (response_consistency >= 0) AND (response_consistency <= 100)
    )
) TABLESPACE pg_default;

-- Índices para hexa_mind_results
CREATE INDEX IF NOT EXISTS idx_hexa_mind_results_user_id ON public.hexa_mind_results USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_hexa_mind_results_completed_at ON public.hexa_mind_results USING btree (completed_at DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_hexa_mind_results_user_completed ON public.hexa_mind_results USING btree (user_id, completed_at DESC) TABLESPACE pg_default;

-- ============================================================================
-- FUNÇÕES SQL
-- ============================================================================

-- Função para atualizar updated_at em five_mind_results
CREATE OR REPLACE FUNCTION public.handle_five_mind_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at em hexa_mind_results
CREATE OR REPLACE FUNCTION public.handle_hexa_mind_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar profile_analysis baseado em resultados do FiveMind
-- Converte TODOS os valores numéricos (1.0-5.0) em características textuais
CREATE OR REPLACE FUNCTION public.update_user_analise_perfil_from_fivemind_results()
RETURNS TRIGGER AS $$
DECLARE
    new_analise_perfil text[] := '{}';
BEGIN
    -- Openness (Abertura à Experiência)
    IF NEW.openness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias');
    ELSIF NEW.openness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Criatividade, curiosidade e abertura a novas ideias');
    ELSIF NEW.openness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Abertura moderada a experiências novas');
    ELSIF NEW.openness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Preferência por rotinas e estabilidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Forte preferência por rotinas, pouca abertura a mudanças');
    END IF;

    -- Conscientiousness (Conscienciosidade)
    IF NEW.conscientiousness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Muito alta organização, disciplina exemplar e extrema responsabilidade');
    ELSIF NEW.conscientiousness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Organização, disciplina e responsabilidade');
    ELSIF NEW.conscientiousness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Nível moderado de organização e planejamento');
    ELSIF NEW.conscientiousness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Preferência por flexibilidade e espontaneidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Alta flexibilidade, baixa necessidade de estrutura');
    END IF;

    -- Extraversion (Extroversão)
    IF NEW.extraversion >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Muito alta sociabilidade, assertividade elevada e energia intensa');
    ELSIF NEW.extraversion >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Sociabilidade, assertividade e energia');
    ELSIF NEW.extraversion >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Equilíbrio entre sociabilidade e momentos de introspecção');
    ELSIF NEW.extraversion >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Preferência por ambientes mais reservados e grupos pequenos');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Alto nível de introversão, prefere atividades solitárias');
    END IF;

    -- Agreeableness (Amabilidade)
    IF NEW.agreeableness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Muito alta empatia, cooperação exemplar e grande confiança nos outros');
    ELSIF NEW.agreeableness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Empatia, cooperação e confiança');
    ELSIF NEW.agreeableness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Nível moderado de empatia e disposição para colaborar');
    ELSIF NEW.agreeableness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Tendência a ser mais direto e menos complacente');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Alta assertividade, preferência por competição sobre cooperação');
    END IF;

    -- Neuroticism (Estabilidade Emocional) - Valores BAIXOS = Estabilidade
    IF NEW.neuroticism <= 1.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Muito alta resiliência, extrema calma e excelente controle emocional');
    ELSIF NEW.neuroticism <= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Resiliência, calma e controle emocional');
    ELSIF NEW.neuroticism <= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Reatividade emocional moderada');
    ELSIF NEW.neuroticism <= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Maior sensibilidade emocional e reatividade ao estresse');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Alta sensibilidade emocional, necessidade de apoio em situações estressantes');
    END IF;

    -- Atualizar profile_analysis do usuário
    UPDATE public.users
    SET profile_analysis = new_analise_perfil,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar profile_analysis baseado em resultados do HexaMind
CREATE OR REPLACE FUNCTION public.update_user_analise_perfil_from_hexamind_results()
RETURNS TRIGGER AS $$
DECLARE
    new_analise_perfil text[] := '{}';
BEGIN
    -- Honesty (Honestidade/Humildade)
    IF NEW.honesty >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Honestidade: Muito alta integridade, transparência exemplar e grande humildade');
    ELSIF NEW.honesty >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Honestidade: Integridade, transparência e humildade');
    ELSIF NEW.honesty >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Honestidade: Nível moderado de integridade e transparência');
    ELSIF NEW.honesty >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Honestidade: Tendência a ser mais assertivo e menos complacente');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Honestidade: Alta assertividade, preferência por competição');
    END IF;

    -- Emotional Stability (Estabilidade Emocional)
    IF NEW.emotional_stability >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Muito alta resiliência, extrema calma e excelente controle emocional');
    ELSIF NEW.emotional_stability >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Resiliência, calma e controle emocional');
    ELSIF NEW.emotional_stability >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Reatividade emocional moderada');
    ELSIF NEW.emotional_stability >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Maior sensibilidade emocional e reatividade ao estresse');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Estabilidade Emocional: Alta sensibilidade emocional, necessidade de apoio em situações estressantes');
    END IF;

    -- Extraversion (Extroversão)
    IF NEW.extraversion >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Muito alta sociabilidade, assertividade elevada e energia intensa');
    ELSIF NEW.extraversion >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Sociabilidade, assertividade e energia');
    ELSIF NEW.extraversion >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Equilíbrio entre sociabilidade e momentos de introspecção');
    ELSIF NEW.extraversion >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Preferência por ambientes mais reservados e grupos pequenos');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Extroversão: Alto nível de introversão, prefere atividades solitárias');
    END IF;

    -- Agreeableness (Amabilidade)
    IF NEW.agreeableness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Muito alta empatia, cooperação exemplar e grande confiança nos outros');
    ELSIF NEW.agreeableness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Empatia, cooperação e confiança');
    ELSIF NEW.agreeableness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Nível moderado de empatia e disposição para colaborar');
    ELSIF NEW.agreeableness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Tendência a ser mais direto e menos complacente');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Amabilidade: Alta assertividade, preferência por competição sobre cooperação');
    END IF;

    -- Conscientiousness (Conscienciosidade)
    IF NEW.conscientiousness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Muito alta organização, disciplina exemplar e extrema responsabilidade');
    ELSIF NEW.conscientiousness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Organização, disciplina e responsabilidade');
    ELSIF NEW.conscientiousness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Nível moderado de organização e planejamento');
    ELSIF NEW.conscientiousness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Preferência por flexibilidade e espontaneidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Conscienciosidade: Alta flexibilidade, baixa necessidade de estrutura');
    END IF;

    -- Openness (Abertura à Experiência)
    IF NEW.openness >= 4.5 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias');
    ELSIF NEW.openness >= 4.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Criatividade, curiosidade e abertura a novas ideias');
    ELSIF NEW.openness >= 3.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Abertura moderada a experiências novas');
    ELSIF NEW.openness >= 2.0 THEN
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Preferência por rotinas e estabilidade');
    ELSE
        new_analise_perfil := array_append(new_analise_perfil, 
            'Abertura à Experiências: Forte preferência por rotinas, pouca abertura a mudanças');
    END IF;

    -- Atualizar profile_analysis do usuário
    UPDATE public.users
    SET profile_analysis = new_analise_perfil,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para atualizar updated_at em five_mind_results
CREATE TRIGGER handle_five_mind_results_updated_at
    BEFORE UPDATE ON public.five_mind_results
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_five_mind_results_updated_at();

-- Trigger para atualizar profile_analysis quando FiveMind é inserido
CREATE TRIGGER trigger_update_analise_perfil_from_fivemind_results
    AFTER INSERT ON public.five_mind_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_analise_perfil_from_fivemind_results();

-- Trigger para atualizar updated_at em hexa_mind_results
CREATE TRIGGER handle_hexa_mind_results_updated_at
    BEFORE UPDATE ON public.hexa_mind_results
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_hexa_mind_results_updated_at();

-- Trigger para atualizar profile_analysis quando HexaMind é inserido
CREATE TRIGGER trigger_update_analise_perfil_from_hexamind_results
    AFTER INSERT ON public.hexa_mind_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_analise_perfil_from_hexamind_results();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em five_mind_results
ALTER TABLE public.five_mind_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para five_mind_results
CREATE POLICY "Users can view own five_mind_results" ON public.five_mind_results FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own five_mind_results" ON public.five_mind_results FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own five_mind_results" ON public.five_mind_results FOR
UPDATE USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can delete own five_mind_results" ON public.five_mind_results FOR DELETE USING (auth.uid () = user_id);

-- Habilitar RLS em hexa_mind_results
ALTER TABLE public.hexa_mind_results ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para hexa_mind_results
CREATE POLICY "Users can view own hexa_mind_results" ON public.hexa_mind_results FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own hexa_mind_results" ON public.hexa_mind_results FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own hexa_mind_results" ON public.hexa_mind_results FOR
UPDATE USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can delete own hexa_mind_results" ON public.hexa_mind_results FOR DELETE USING (auth.uid () = user_id);

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON
TABLE public.five_mind_results IS 'Resultados detalhados das avaliações FiveMind (Big Five)';

COMMENT ON
TABLE public.hexa_mind_results IS 'Resultados detalhados das avaliações HexaMind (6 Fatores)';

COMMENT ON COLUMN public.five_mind_results.openness IS 'Score de Abertura à Experiência (1.0 a 5.0)';

COMMENT ON COLUMN public.five_mind_results.conscientiousness IS 'Score de Conscienciosidade (1.0 a 5.0)';

COMMENT ON COLUMN public.five_mind_results.extraversion IS 'Score de Extroversão (1.0 a 5.0)';

COMMENT ON COLUMN public.five_mind_results.agreeableness IS 'Score de Amabilidade (1.0 a 5.0)';

COMMENT ON COLUMN public.five_mind_results.neuroticism IS 'Score de Neuroticismo (1.0 a 5.0) - Valores baixos indicam estabilidade';

COMMENT ON COLUMN public.hexa_mind_results.honesty IS 'Score de Honestidade/Humildade (1.0 a 5.0)';

COMMENT ON COLUMN public.hexa_mind_results.emotional_stability IS 'Score de Estabilidade Emocional (1.0 a 5.0)';

COMMENT ON COLUMN public.hexa_mind_results.consistency IS 'Score de Consistência (1.0 a 5.0)';

COMMENT ON COLUMN public.hexa_mind_results.response_consistency IS 'Consistência das respostas (0 a 100)';