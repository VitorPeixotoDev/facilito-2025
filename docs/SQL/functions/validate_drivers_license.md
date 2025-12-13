# Função: validate_drivers_license()

## Descrição
Função trigger que valida os valores do array `has_drivers_license` antes de inserir ou atualizar uma linha na tabela `users`. Garante que apenas tipos válidos de CNH sejam aceitos.

## Parâmetros
Nenhum. Esta função é executada automaticamente pelo trigger.

## Retorno
- `NEW` - A linha com os dados validados
- Lança uma exceção se encontrar valores inválidos

## Funcionalidade
Esta função valida que todos os valores no array `has_drivers_license` sejam tipos válidos de CNH brasileira. Os tipos permitidos são:
- `A` - Motocicleta
- `B` - Automóvel
- `C` - Caminhão
- `D` - Ônibus
- `E` - Carreta
- `AB` - Motocicleta e Automóvel
- `AC` - Motocicleta e Caminhão
- `AD` - Motocicleta e Ônibus
- `AE` - Motocicleta e Carreta

## Validação
- Se `has_drivers_license` for `NULL`, a validação é ignorada
- Se o array contiver valores, cada valor é verificado contra a lista de tipos permitidos
- Se algum valor não estiver na lista, uma exceção é lançada com mensagem de erro

## Uso
A função é executada automaticamente pelo trigger `validate_drivers_license_trigger` que é criado na tabela `users`.

## Exemplo de Uso
```sql
-- Exemplo válido
UPDATE users 
SET has_drivers_license = ARRAY['B', 'C'] 
WHERE id = 'user-uuid';
-- ✅ Sucesso

-- Exemplo inválido
UPDATE users 
SET has_drivers_license = ARRAY['B', 'X'] 
WHERE id = 'user-uuid';
-- ❌ Erro: Valor inválido para has_drivers_license: X. Valores permitidos: A, B, C, D, E, AB, AC, AD, AE
```

## Código SQL
```sql
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
```

## Observações
- A função valida tanto em `INSERT` quanto em `UPDATE`
- A validação é case-sensitive (maiúsculas/minúsculas importam)
- Se precisar adicionar novos tipos de CNH, atualize o array `valid_licenses` na função

