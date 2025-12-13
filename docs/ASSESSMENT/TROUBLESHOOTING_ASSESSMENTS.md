# Troubleshooting - Sistema de Avaliações

## Problema: `analise_perfil` não está sendo atualizado

### Causa Principal: Políticas RLS

O problema mais comum é que as políticas RLS (Row Level Security) estão bloqueando a atualização. O trigger executa com os privilégios do usuário que fez a inserção, mas a política de UPDATE só permite que o usuário atualize seu próprio perfil.

**Solução:** A função deve ser criada com `SECURITY DEFINER` para executar com privilégios elevados e contornar as políticas RLS.

Execute o script `docs/sql/fix_trigger_rls.sql` para corrigir.

### Verificações

1. **Verificar se o trigger existe:**
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_analise_perfil_from_fivemind';
```

2. **Verificar se a função existe:**
```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'update_user_analise_perfil_from_fivemind';
```

3. **Verificar os últimos resultados inseridos:**
```sql
SELECT 
    id,
    user_id,
    assessment_id,
    results,
    completed_at
FROM public.assessment_results
WHERE assessment_id = 'five-mind'
ORDER BY completed_at DESC
LIMIT 5;
```

4. **Verificar se os dados estão no formato correto:**
```sql
SELECT 
    user_id,
    results->>'openness' as openness,
    results->>'conscientiousness' as conscientiousness,
    results->>'extraversion' as extraversion,
    results->>'agreeableness' as agreeableness,
    results->>'neuroticism' as neuroticism
FROM public.assessment_results
WHERE assessment_id = 'five-mind'
ORDER BY completed_at DESC
LIMIT 1;
```

5. **Verificar analise_perfil do usuário:**
```sql
SELECT 
    u.id,
    u.full_name,
    u.analise_perfil
FROM public.users u
WHERE u.id = 'SEU_USER_ID_AQUI';
```

### Soluções

#### Solução 1: Recriar o trigger

Execute novamente a parte do script SQL que cria o trigger:

```sql
DROP TRIGGER IF EXISTS trigger_update_analise_perfil_from_fivemind ON public.assessment_results;
CREATE TRIGGER trigger_update_analise_perfil_from_fivemind
    AFTER INSERT ON public.assessment_results
    FOR EACH ROW
    EXECUTE FUNCTION update_user_analise_perfil_from_fivemind();
```

#### Solução 2: Executar a função manualmente

Se o trigger não estiver funcionando, você pode executar a função manualmente para um resultado específico:

```sql
-- Primeiro, encontre o ID do resultado
SELECT id, user_id, results
FROM public.assessment_results
WHERE assessment_id = 'five-mind'
ORDER BY completed_at DESC
LIMIT 1;

-- Depois, execute a função (substitua os valores)
DO $$
DECLARE
    v_result RECORD;
BEGIN
    SELECT * INTO v_result
    FROM public.assessment_results
    WHERE assessment_id = 'five-mind'
    ORDER BY completed_at DESC
    LIMIT 1;
    
    -- Chama a função como se fosse um trigger
    PERFORM update_user_analise_perfil_from_fivemind() FROM (SELECT v_result.*) AS t;
END $$;
```

#### Solução 3: Atualizar manualmente

Se nada funcionar, você pode atualizar manualmente:

```sql
UPDATE public.users
SET analise_perfil = ARRAY[
    CASE WHEN (SELECT (results->>'openness')::DECIMAL FROM public.assessment_results WHERE user_id = users.id AND assessment_id = 'five-mind' ORDER BY completed_at DESC LIMIT 1) >= 4.0 THEN 'Criativo e Inovador' END,
    CASE WHEN (SELECT (results->>'conscientiousness')::DECIMAL FROM public.assessment_results WHERE user_id = users.id AND assessment_id = 'five-mind' ORDER BY completed_at DESC LIMIT 1) >= 4.0 THEN 'Organizado e Disciplinado' END,
    CASE WHEN (SELECT (results->>'extraversion')::DECIMAL FROM public.assessment_results WHERE user_id = users.id AND assessment_id = 'five-mind' ORDER BY completed_at DESC LIMIT 1) >= 4.0 THEN 'Comunicativo e Sociável' END,
    CASE WHEN (SELECT (results->>'agreeableness')::DECIMAL FROM public.assessment_results WHERE user_id = users.id AND assessment_id = 'five-mind' ORDER BY completed_at DESC LIMIT 1) >= 4.0 THEN 'Empático e Colaborativo' END,
    CASE WHEN (SELECT (results->>'neuroticism')::DECIMAL FROM public.assessment_results WHERE user_id = users.id AND assessment_id = 'five-mind' ORDER BY completed_at DESC LIMIT 1) <= 2.0 THEN 'Resiliente e Estável' END
]
WHERE id IN (
    SELECT DISTINCT user_id 
    FROM public.assessment_results 
    WHERE assessment_id = 'five-mind'
);
```

### Logs

Verifique os logs do Supabase para ver se há erros:
- Dashboard do Supabase → Logs → Database Logs
- Procure por mensagens de WARNING ou ERROR relacionadas ao trigger

### Console do Navegador

Verifique o console do navegador para ver:
- Se os resultados estão sendo salvos corretamente
- Se há erros na chamada da API
- Os logs de debug que foram adicionados

