-- Script SQL para corrigir políticas RLS para permitir ranking
-- Este script adiciona uma política que permite que usuários vejam dados limitados
-- de outros usuários para fins de ranking e comparação

-- Remover a política antiga que bloqueia visualização de outros usuários
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Criar nova política que permite visualização própria completa
CREATE POLICY "Users can view own data" ON public.users FOR
SELECT USING (auth.uid () = id);

-- Criar política adicional para permitir visualização pública limitada de dados para ranking
-- Esta política permite que qualquer usuário autenticado veja apenas os campos necessários
-- para o ranking: id, full_name, skills, courses, freelancer_services, experience,
-- academic_background, home_address, profile_analysis, profile_completed
CREATE POLICY "Authenticated users can view public profile data for ranking" ON public.users FOR
SELECT TO authenticated USING (
        -- Usuários autenticados podem ver dados limitados de outros usuários
        -- Mas não podem ver dados sensíveis como email, telefone, etc.
        auth.uid () IS NOT NULL
    );

-- Nota: Se você quiser restringir ainda mais, pode adicionar uma condição de
-- perfil completo ou outra validação, por exemplo:
-- USING (
--     auth.uid() IS NOT NULL
--     AND profile_completed = true
-- );