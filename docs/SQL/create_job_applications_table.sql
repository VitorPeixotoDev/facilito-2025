-- ============================================================================
-- Script SQL para criação da tabela job_applications
-- Esta tabela armazena as candidaturas de usuários (users) para vagas (jobs)
-- ============================================================================

-- Criar a tabela job_applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL,
    user_id uuid NOT NULL,
    applied_at timestamp with time zone NOT NULL DEFAULT now(),
    status text NULL DEFAULT 'pendente'::text,
    notes text NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT job_applications_pkey PRIMARY KEY (id),
    CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) 
        REFERENCES public.jobs(id) ON DELETE CASCADE,
    CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT job_applications_job_user_unique UNIQUE (job_id, user_id)
) TABLESPACE pg_default;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications USING btree (job_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications USING btree (user_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications USING btree (applied_at DESC) TABLESPACE pg_default;

-- Comentários nas colunas
COMMENT ON
TABLE public.job_applications IS 'Tabela de candidaturas de usuários para vagas';

COMMENT ON COLUMN public.job_applications.id IS 'Identificador único da candidatura';

COMMENT ON COLUMN public.job_applications.job_id IS 'ID da vaga (jobs)';

COMMENT ON COLUMN public.job_applications.user_id IS 'ID do usuário candidato';

COMMENT ON COLUMN public.job_applications.applied_at IS 'Data e hora da candidatura';

COMMENT ON COLUMN public.job_applications.status IS 'Status da candidatura (pendente, em_revisao, aprovado, reprovado)';

COMMENT ON COLUMN public.job_applications.notes IS 'Notas adicionais sobre a candidatura';

-- ============================================================================
-- TRIGGER: Atualização automática de updated_at
-- ============================================================================

-- Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER handle_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TRIGGER: Atualização automática do contador de candidaturas na tabela jobs
-- ============================================================================

-- Criar função para incrementar applications_count
CREATE OR REPLACE FUNCTION public.increment_job_applications()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.jobs
    SET 
        applications_count = applications_count + 1,
        new_applications_last_24h = CASE 
            WHEN NEW.applied_at > now() - interval '24 hours' 
            THEN new_applications_last_24h + 1 
            ELSE new_applications_last_24h 
        END,
        last_activity_at = now()
    WHERE id = NEW.job_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para incrementar contador ao inserir candidatura
CREATE TRIGGER trigger_increment_job_applications
    AFTER INSERT ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_job_applications();

-- Criar função para decrementar applications_count
CREATE OR REPLACE FUNCTION public.decrement_job_applications()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.jobs
    SET 
        applications_count = GREATEST(applications_count - 1, 0),
        new_applications_last_24h = CASE 
            WHEN OLD.applied_at > now() - interval '24 hours' 
            THEN GREATEST(new_applications_last_24h - 1, 0)
            ELSE new_applications_last_24h 
        END,
        last_activity_at = now()
    WHERE id = OLD.job_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para decrementar contador ao remover candidatura
CREATE TRIGGER trigger_decrement_job_applications
    AFTER DELETE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_job_applications();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS na tabela
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: Usuários podem ver apenas suas próprias candidaturas
CREATE POLICY "Users can view own applications" ON public.job_applications FOR
SELECT TO authenticated USING (auth.uid () = user_id);

-- Política adicional: Recruiters podem ver candidaturas das suas vagas
-- Nota: Requer verificação se o usuário é recruiter através da tabela recruiter
CREATE POLICY "Recruiters can view applications for their jobs" ON public.job_applications FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.jobs j
                INNER JOIN public.recruiter r ON r.user_id = j.owner_id
            WHERE
                j.id = job_applications.job_id
                AND r.user_id = auth.uid ()
        )
    );

-- Política para INSERT: Usuários podem criar apenas suas próprias candidaturas
CREATE POLICY "Users can insert own applications" ON public.job_applications FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

-- Política para UPDATE: Usuários podem atualizar apenas suas próprias candidaturas
-- Recruiters podem atualizar candidaturas das suas vagas
CREATE POLICY "Users can update own applications" ON public.job_applications FOR
UPDATE TO authenticated USING (auth.uid () = user_id)
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Recruiters can update applications for their jobs" ON public.job_applications FOR
UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.jobs j
            INNER JOIN public.recruiter r ON r.user_id = j.owner_id
        WHERE
            j.id = job_applications.job_id
            AND r.user_id = auth.uid ()
    )
)
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.jobs j
                INNER JOIN public.recruiter r ON r.user_id = j.owner_id
            WHERE
                j.id = job_applications.job_id
                AND r.user_id = auth.uid ()
        )
    );

-- Política para DELETE: Usuários podem remover apenas suas próprias candidaturas
CREATE POLICY "Users can delete own applications" ON public.job_applications FOR DELETE TO authenticated USING (auth.uid () = user_id);

-- ============================================================================
-- FUNÇÕES RPC ÚTEIS (opcional, para uso em actions)
-- ============================================================================

-- Função para incrementar applications_count (pode ser chamada diretamente)
CREATE OR REPLACE FUNCTION public.increment_job_applications(job_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.jobs
    SET 
        applications_count = applications_count + 1,
        last_activity_at = now()
    WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar applications_count (pode ser chamada diretamente)
CREATE OR REPLACE FUNCTION public.decrement_job_applications(job_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.jobs
    SET 
        applications_count = GREATEST(applications_count - 1, 0),
        last_activity_at = now()
    WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;