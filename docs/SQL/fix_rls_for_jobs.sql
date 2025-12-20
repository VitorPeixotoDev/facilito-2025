-- ============================================================================
-- Script SQL para configurar políticas RLS na tabela jobs
-- Este script permite que usuários autenticados vejam todas as vagas disponíveis
-- e que apenas recruiters (dono da vaga) possam gerenciar suas próprias vagas
-- ============================================================================

-- Habilitar RLS na tabela jobs (se ainda não estiver habilitado)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS PARA SELECT (LEITURA)
-- ============================================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can view jobs" ON public.jobs;

DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;

-- Política: Todos os usuários autenticados podem ver vagas com status 'recebendo_candidatos'
CREATE POLICY "Authenticated users can view available jobs" 
    ON public.jobs 
    FOR SELECT 
    TO authenticated
    USING (
        status = 'recebendo_candidatos'::job_status
        OR owner_id = auth.uid()  -- Recruiters podem ver suas próprias vagas independente do status
    );

-- Política adicional: Recruiters podem ver todas as suas vagas (qualquer status)
-- Esta política já está coberta pela anterior, mas deixamos explícito para clareza
-- (A condição owner_id = auth.uid() já permite isso)

-- ============================================================================
-- POLÍTICAS RLS PARA INSERT (CRIAÇÃO)
-- ============================================================================

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Recruiters can insert jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can insert jobs" ON public.jobs;

-- Política: Apenas recruiters podem criar vagas
CREATE POLICY "Recruiters can insert jobs" ON public.jobs FOR
INSERT
    TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.recruiter
            WHERE
                user_id = auth.uid ()
        )
        AND owner_id = auth.uid () -- Garante que owner_id seja o próprio usuário
    );

-- ============================================================================
-- POLÍTICAS RLS PARA UPDATE (ATUALIZAÇÃO)
-- ============================================================================

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Recruiters can update own jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can update jobs" ON public.jobs;

-- Política: Apenas o dono (recruiter) da vaga pode atualizá-la
CREATE POLICY "Recruiters can update own jobs" ON public.jobs FOR
UPDATE TO authenticated USING (owner_id = auth.uid ())
WITH
    CHECK (owner_id = auth.uid ());

-- ============================================================================
-- POLÍTICAS RLS PARA DELETE (EXCLUSÃO)
-- ============================================================================

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Recruiters can delete own jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can delete jobs" ON public.jobs;

-- Política: Apenas o dono (recruiter) da vaga pode deletá-la
CREATE POLICY "Recruiters can delete own jobs" ON public.jobs FOR DELETE TO authenticated USING (owner_id = auth.uid ());

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Para verificar se as políticas foram criadas corretamente:
-- SELECT * FROM pg_policies WHERE tablename = 'jobs';