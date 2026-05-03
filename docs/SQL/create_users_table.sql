-- Script SQL para criação da tabela users
-- Este script cria a tabela users com todas as colunas, constraints, índices e triggers necessários

-- Criação da tabela users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  email character varying(255) NULL,
  full_name character varying(500) NULL,
  description text NULL,
  instagram character varying(100) NULL,
  facebook character varying(100) NULL,
  linkedin character varying(100) NULL,
  whatsapp character varying(50) NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
  contact_email character varying(255) NULL,
  skills text[] NULL DEFAULT '{}'::text[],
  experience jsonb NULL,
  portfolio character varying(1000) NULL,
  academic_background text NULL,
  has_children boolean NULL,
  has_drivers_license text[] NULL DEFAULT '{}'::text[],
  home_address jsonb NULL,
  birth_date date NULL,
  courses text[] NULL DEFAULT '{}'::text[],
  freelancer_services text[] NULL DEFAULT '{}'::text[],
  profile_completed boolean NOT NULL DEFAULT false,
  profile_analysis text[] NULL DEFAULT '{}'::text[],
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT home_address_format CHECK (
    (
      (home_address IS NULL)
      OR (
        (home_address ? 'latitude'::text)
        AND (home_address ? 'longitude'::text)
        AND (home_address ? 'description'::text)
        AND (
          ((home_address ->> 'latitude'::text))::double precision >= ('-90'::integer)::double precision
          AND ((home_address ->> 'latitude'::text))::double precision <= (90)::double precision
        )
        AND (
          ((home_address ->> 'longitude'::text))::double precision >= ('-180'::integer)::double precision
          AND ((home_address ->> 'longitude'::text))::double precision <= (180)::double precision
        )
        AND (home_address ->> 'description'::text) IS NOT NULL
      )
    )
  )
) TABLESPACE pg_default;

-- Criação de índices
-- Nota: Os índices abaixo referenciam colunas que podem não existir na tabela.
-- Ajuste conforme necessário ou remova se as colunas não existirem.

-- Índice único para usersub (se a coluna existir)
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_users_usersub_idx
--   ON public.users USING btree (usersub)
--   TABLESPACE pg_default;

-- Índice GIN para profile_analysis (ajustado para usar profile_analysis ao invés de analise_perfil)
CREATE INDEX IF NOT EXISTS idx_users_profile_analysis ON public.users USING gin (profile_analysis) TABLESPACE pg_default;

-- Criação de funções necessárias para os triggers

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para validar has_drivers_license
-- Valida que os valores no array sejam apenas valores permitidos
CREATE OR REPLACE FUNCTION public.validate_drivers_license()
RETURNS TRIGGER AS $$
DECLARE
  valid_licenses text[] := ARRAY['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];
  license_value text;
BEGIN
  -- Se has_drivers_license não é NULL, valida cada valor
  IF NEW.has_drivers_license IS NOT NULL THEN
    FOREACH license_value IN ARRAY NEW.has_drivers_license
    LOOP
      IF NOT (license_value = ANY(valid_licenses)) THEN
        RAISE EXCEPTION 'Valor inválido para has_drivers_license: %. Valores permitidos: %', 
          license_value, array_to_string(valid_licenses, ', ');
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criação de triggers

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger para validar has_drivers_license
CREATE TRIGGER validate_drivers_license_trigger 
  BEFORE INSERT OR UPDATE ON public.users 
  FOR EACH ROW
  EXECUTE FUNCTION validate_drivers_license();

-- Comentários nas colunas principais
COMMENT ON TABLE public.users IS 'Tabela de usuários do sistema';

COMMENT ON COLUMN public.users.id IS 'Identificador único do usuário (UUID)';

COMMENT ON COLUMN public.users.email IS 'Email principal do usuário';

COMMENT ON COLUMN public.users.full_name IS 'Nome completo do usuário';

COMMENT ON COLUMN public.users.profile_completed IS 'Indica se o perfil do usuário foi completado';

COMMENT ON COLUMN public.users.home_address IS 'Endereço residencial em formato JSONB com latitude, longitude e description';

-- Habilitar Row Level Security (RLS) na tabela
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS padrão para a tabela users

-- Política para SELECT: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data" ON public.users FOR
SELECT USING (auth.uid () = id);

-- Política para INSERT: Usuários podem inserir apenas seus próprios dados
CREATE POLICY "Users can insert own data" ON public.users FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- Política para UPDATE: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own data" ON public.users FOR
UPDATE USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);

-- Política para DELETE: Usuários podem deletar apenas seus próprios dados
-- Nota: Descomente se desejar permitir que usuários deletem seus próprios perfis
-- CREATE POLICY "Users can delete own data"
--   ON public.users
--   FOR DELETE
--   USING (auth.uid() = id);