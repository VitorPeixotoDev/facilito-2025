-- Script SQL para adicionar coluna graduations na tabela users
-- Esta coluna armazena informações sobre graduações do usuário

-- Remover coluna graduations se existir (caso tenha sido criada com tipo incorreto)
ALTER TABLE public.users DROP COLUMN IF EXISTS graduations;

-- Adicionar coluna graduations na tabela users como text[]
ALTER TABLE public.users 
ADD COLUMN graduations text[] NULL DEFAULT '{}'::text[];

-- Comentário na coluna
COMMENT ON COLUMN public.users.graduations IS 'Array de strings contendo informações sobre graduações do usuário';

-- Criar índice GIN para busca eficiente
CREATE INDEX IF NOT EXISTS idx_users_graduations_gin ON public.users USING gin (graduations);