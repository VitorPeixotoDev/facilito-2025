-- =============================================================================
-- Busca de vagas por código de 6 dígitos (recruiter_location_codes)
-- =============================================================================
-- A tabela recruiter_location_codes já existe; a coluna do código é code_6_digits.
-- Este script apenas:
-- 1) Adiciona a coluna recruiter_location_code_id na tabela jobs (se não existir)
-- 2) Cria índice e comentário
-- 3) Configura RLS na recruiter_location_codes (se necessário)
-- =============================================================================

-- Adicionar coluna em jobs (nullable para vagas sem código)
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS recruiter_location_code_id uuid NULL REFERENCES public.recruiter_location_codes (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.jobs.recruiter_location_code_id IS 'Código de localização do recrutador para busca por 6 dígitos (code_6_digits em recruiter_location_codes)';

CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_location_code_id ON public.jobs USING btree (recruiter_location_code_id);

-- RLS na recruiter_location_codes: usuários autenticados podem ler (para buscar vagas)
ALTER TABLE public.recruiter_location_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read recruiter_location_codes" ON public.recruiter_location_codes;

CREATE POLICY "Authenticated can read recruiter_location_codes" ON public.recruiter_location_codes FOR
SELECT TO authenticated USING (true);

-- Recruiters podem gerenciar códigos (opcional)
DROP POLICY IF EXISTS "Recruiters can manage recruiter_location_codes" ON public.recruiter_location_codes;

CREATE POLICY "Recruiters can manage recruiter_location_codes" ON public.recruiter_location_codes FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.recruiter r
        WHERE
            r.user_id = auth.uid ()
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.recruiter r
            WHERE
                r.user_id = auth.uid ()
        )
    );