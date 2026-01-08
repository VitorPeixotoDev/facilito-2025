-- Script SQL para migração retroativa de certificações
-- Este script atualiza a coluna certifications para usuários que já concluíram avaliações
-- antes da implementação da coluna certifications

-- Função para adicionar certificação única ao array de certificações
-- Se a certificação já existir, não adiciona novamente
CREATE OR REPLACE FUNCTION add_certification_unique(
    current_certifications text[],
    new_certification text
) RETURNS text[] AS $$
BEGIN
    -- Se o array é NULL, inicializa com array vazio
    IF current_certifications IS NULL THEN
        current_certifications := '{}'::text[];
    END IF;
    
    -- Verifica se a certificação já existe (case-insensitive)
    IF EXISTS (
        SELECT 1 
        FROM unnest(current_certifications) AS cert
        WHERE LOWER(cert) = LOWER(new_certification)
    ) THEN
        -- Já existe, retorna o array original
        RETURN current_certifications;
    END IF;
    
    -- Não existe, adiciona ao array
    RETURN array_append(current_certifications, new_certification);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Atualizar certificações para usuários que já concluíram FiveMind
-- Adiciona 'fivemind' se já tiver resultado em five_mind_results
UPDATE public.users
SET 
    certifications = add_certification_unique(certifications, 'fivemind'),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM public.five_mind_results
    WHERE user_id IS NOT NULL
)
AND NOT EXISTS (
    SELECT 1 
    FROM unnest(COALESCE(certifications, '{}'::text[])) AS cert
    WHERE LOWER(cert) = 'fivemind'
);

-- Atualizar certificações para usuários que já concluíram HexaMind (SixMind)
-- Adiciona 'sixmind' se já tiver resultado em hexa_mind_results
UPDATE public.users
SET 
    certifications = add_certification_unique(certifications, 'sixmind'),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM public.hexa_mind_results
    WHERE user_id IS NOT NULL
)
AND NOT EXISTS (
    SELECT 1 
    FROM unnest(COALESCE(certifications, '{}'::text[])) AS cert
    WHERE LOWER(cert) = 'sixmind'
);

-- Remover a função auxiliar após uso (opcional, mas recomendado)
DROP FUNCTION IF EXISTS add_certification_unique(text[], text);

-- Estatísticas da migração
DO $$
DECLARE
    fivemind_count INTEGER;
    sixmind_count INTEGER;
    both_count INTEGER;
BEGIN
    -- Contar usuários com fivemind
    SELECT COUNT(*) INTO fivemind_count
    FROM public.users
    WHERE EXISTS (
        SELECT 1 
        FROM unnest(COALESCE(certifications, '{}'::text[])) AS cert
        WHERE LOWER(cert) = 'fivemind'
    );
    
    -- Contar usuários com sixmind
    SELECT COUNT(*) INTO sixmind_count
    FROM public.users
    WHERE EXISTS (
        SELECT 1 
        FROM unnest(COALESCE(certifications, '{}'::text[])) AS cert
        WHERE LOWER(cert) = 'sixmind'
    );
    
    -- Contar usuários com ambas
    SELECT COUNT(*) INTO both_count
    FROM public.users
    WHERE EXISTS (
        SELECT 1 
        FROM unnest(COALESCE(certifications, '{}'::text[])) AS cert
        WHERE LOWER(cert) = 'fivemind'
    )
    AND EXISTS (
        SELECT 1 
        FROM unnest(COALESCE(certifications, '{}'::text[])) AS cert
        WHERE LOWER(cert) = 'sixmind'
    );
    
    RAISE NOTICE 'Migração concluída:';
    RAISE NOTICE '  - Usuários com certificação fivemind: %', fivemind_count;
    RAISE NOTICE '  - Usuários com certificação sixmind: %', sixmind_count;
    RAISE NOTICE '  - Usuários com ambas certificações: %', both_count;
END $$;