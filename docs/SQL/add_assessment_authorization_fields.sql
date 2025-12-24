-- ============================================================================
-- Script SQL para adicionar campos de autorização nas tabelas de resultados
-- Este script adiciona campos para controle de autorização de sugestões
-- e exibição de resultados brutos
-- ============================================================================

-- ============================================================================
-- ADICIONAR CAMPOS EM five_mind_results
-- ============================================================================

-- Adicionar colunas de autorização
ALTER TABLE public.five_mind_results
    ADD COLUMN IF NOT EXISTS authorized_for_suggestions boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS authorized_to_show_results boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone NULL;

-- Comentários
COMMENT ON COLUMN public.five_mind_results.authorized_for_suggestions IS 
    'Se true, permite gerar sugestões de competências baseadas nos resultados';
COMMENT ON COLUMN public.five_mind_results.authorized_to_show_results IS 
    'Se true, permite exibir resultados brutos (não implementado ainda)';
COMMENT ON COLUMN public.five_mind_results.expires_at IS 
    'Data de expiração da autorização (padrão: 1 ano após completed_at)';

-- Criar índice para consultas por expiração
CREATE INDEX IF NOT EXISTS idx_five_mind_results_expires_at 
    ON public.five_mind_results (expires_at) 
    WHERE expires_at IS NOT NULL;

-- ============================================================================
-- ADICIONAR CAMPOS EM hexa_mind_results
-- ============================================================================

-- Adicionar colunas de autorização
ALTER TABLE public.hexa_mind_results
    ADD COLUMN IF NOT EXISTS authorized_for_suggestions boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS authorized_to_show_results boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone NULL;

-- Comentários
COMMENT ON COLUMN public.hexa_mind_results.authorized_for_suggestions IS 
    'Se true, permite gerar sugestões de competências baseadas nos resultados';
COMMENT ON COLUMN public.hexa_mind_results.authorized_to_show_results IS 
    'Se true, permite exibir resultados brutos (não implementado ainda)';
COMMENT ON COLUMN public.hexa_mind_results.expires_at IS 
    'Data de expiração da autorização (padrão: 1 ano após completed_at)';

-- Criar índice para consultas por expiração
CREATE INDEX IF NOT EXISTS idx_hexa_mind_results_expires_at 
    ON public.hexa_mind_results (expires_at) 
    WHERE expires_at IS NOT NULL;

-- ============================================================================
-- ADICIONAR COLUNA authorized_competencies EM users
-- ============================================================================

-- Adicionar coluna para armazenar competências autorizadas pelo usuário
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS authorized_competencies text[] NULL DEFAULT '{}'::text[];

-- Comentário
COMMENT ON COLUMN public.users.authorized_competencies IS 
    'Array de competências autorizadas pelo usuário para exibição pública, baseadas em resultados de avaliações';

-- Criar índice GIN para busca eficiente em arrays
CREATE INDEX IF NOT EXISTS idx_users_authorized_competencies 
    ON public.users USING gin (authorized_competencies) 
    WHERE authorized_competencies IS NOT NULL AND array_length(authorized_competencies, 1) > 0;

