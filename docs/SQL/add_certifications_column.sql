-- Script SQL para adicionar coluna certifications na tabela users
-- Esta coluna armazena os nomes das avaliações concluídas pelo usuário
-- Valores: 'fivemind', 'sixmind' (valores únicos, não importa quantas vezes concluiu)

-- Adicionar coluna certifications na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS certifications text[] NULL DEFAULT '{}'::text[];

-- Comentário na coluna
COMMENT ON COLUMN public.users.certifications IS 'Array de strings contendo os nomes das avaliações concluídas pelo usuário. Valores possíveis: ''fivemind'', ''sixmind''. Cada valor é único, ou seja, não importa quantas vezes o usuário concluiu a avaliação, ela será registrada apenas uma vez.';

-- Criar índice GIN para busca eficiente
CREATE INDEX IF NOT EXISTS idx_users_certifications_gin ON public.users USING gin (certifications) TABLESPACE pg_default
WHERE
    certifications IS NOT NULL
    AND array_length (certifications, 1) > 0;