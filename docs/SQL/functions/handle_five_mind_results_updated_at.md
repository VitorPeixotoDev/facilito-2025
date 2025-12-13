# Função: handle_five_mind_results_updated_at()

## Descrição
Função trigger que atualiza automaticamente o campo `updated_at` da tabela `five_mind_results` sempre que uma linha é atualizada.

## Parâmetros
Nenhum. Esta função é executada automaticamente pelo trigger.

## Retorno
- `NEW` - A linha atualizada com o campo `updated_at` modificado

## Funcionalidade
Esta função é chamada automaticamente antes de qualquer operação `UPDATE` na tabela `five_mind_results`. Ela define o campo `updated_at` com o timestamp atual em UTC.

## Uso
A função é executada automaticamente pelo trigger `handle_five_mind_results_updated_at` que é criado na tabela `five_mind_results`.

## Código SQL
```sql
CREATE OR REPLACE FUNCTION public.handle_five_mind_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Observações
- A função usa `timezone('utc'::text, now())` para garantir que o timestamp seja sempre em UTC
- O trigger é configurado para executar `BEFORE UPDATE`, garantindo que o campo seja atualizado antes da operação ser concluída

