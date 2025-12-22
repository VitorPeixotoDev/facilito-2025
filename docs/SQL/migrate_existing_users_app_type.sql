-- ============================================================================
-- Script SQL para migração de usuários existentes
-- Marca como "user" todos os usuários que ainda não têm app_type definido
--
-- IMPORTANTE: Execute este script APENAS UMA VEZ após implementar a feature
-- de app_type. Ele garante que usuários existentes desta aplicação B
-- recebam o app_type = 'user'.
-- ============================================================================

-- Atualizar raw_user_meta_data para incluir app_type = 'user'
-- Apenas para usuários que ainda não têm app_type definido
UPDATE auth.users
SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('app_type', 'user')
WHERE raw_user_meta_data->>'app_type' IS NULL;

-- Verificar quantos usuários foram atualizados
SELECT
    COUNT(*) as usuarios_atualizados,
    COUNT(*) FILTER (
        WHERE
            raw_user_meta_data ->> 'app_type' = 'user'
    ) as usuarios_com_app_type_user
FROM auth.users
WHERE
    raw_user_meta_data ->> 'app_type' = 'user'
    OR raw_user_meta_data ->> 'app_type' IS NULL;

-- Verificar distribuição de app_type (para auditoria)
SELECT COALESCE(
        raw_user_meta_data ->> 'app_type', 'sem_app_type'
    ) as app_type, COUNT(*) as quantidade
FROM auth.users
GROUP BY
    COALESCE(
        raw_user_meta_data ->> 'app_type',
        'sem_app_type'
    )
ORDER BY quantidade DESC;