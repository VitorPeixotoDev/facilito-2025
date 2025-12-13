# Função: update_user_analise_perfil_from_fivemind_results()

## Descrição
Função trigger que atualiza automaticamente o campo `profile_analysis` na tabela `users` quando um novo resultado do FiveMind é inserido. Converte todos os valores numéricos (1.0-5.0) em características de personalidade descritivas.

## Parâmetros
Nenhum. Esta função é executada automaticamente pelo trigger.

## Retorno
- `NEW` - A linha inserida

## Funcionalidade
Esta função é chamada automaticamente após uma operação `INSERT` na tabela `five_mind_results`. Ela:
1. Analisa cada fator do Big Five (openness, conscientiousness, extraversion, agreeableness, neuroticism)
2. Converte os valores numéricos em características textuais descritivas
3. Atualiza o campo `profile_analysis` do usuário na tabela `users`

## Mapeamento de Scores

### Openness (Abertura à Experiência)
- >= 4.5: "Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias"
- >= 4.0: "Abertura à Experiências: Criatividade, curiosidade e abertura a novas ideias"
- >= 3.0: "Abertura à Experiências: Abertura moderada a experiências novas"
- >= 2.0: "Abertura à Experiências: Preferência por rotinas e estabilidade"
- < 2.0: "Abertura à Experiências: Forte preferência por rotinas, pouca abertura a mudanças"

### Conscientiousness (Conscienciosidade)
- >= 4.5: "Conscienciosidade: Muito alta organização, disciplina exemplar e extrema responsabilidade"
- >= 4.0: "Conscienciosidade: Organização, disciplina e responsabilidade"
- >= 3.0: "Conscienciosidade: Nível moderado de organização e planejamento"
- >= 2.0: "Conscienciosidade: Preferência por flexibilidade e espontaneidade"
- < 2.0: "Conscienciosidade: Alta flexibilidade, baixa necessidade de estrutura"

### Extraversion (Extroversão)
- >= 4.5: "Extroversão: Muito alta sociabilidade, assertividade elevada e energia intensa"
- >= 4.0: "Extroversão: Sociabilidade, assertividade e energia"
- >= 3.0: "Extroversão: Equilíbrio entre sociabilidade e momentos de introspecção"
- >= 2.0: "Extroversão: Preferência por ambientes mais reservados e grupos pequenos"
- < 2.0: "Extroversão: Alto nível de introversão, prefere atividades solitárias"

### Agreeableness (Amabilidade)
- >= 4.5: "Amabilidade: Muito alta empatia, cooperação exemplar e grande confiança nos outros"
- >= 4.0: "Amabilidade: Empatia, cooperação e confiança"
- >= 3.0: "Amabilidade: Nível moderado de empatia e disposição para colaborar"
- >= 2.0: "Amabilidade: Tendência a ser mais direto e menos complacente"
- < 2.0: "Amabilidade: Alta assertividade, preferência por competição sobre cooperação"

### Neuroticism (Estabilidade Emocional)
**Nota**: Valores BAIXOS indicam ESTABILIDADE (positivo)
- <= 1.5: "Estabilidade Emocional: Muito alta resiliência, extrema calma e excelente controle emocional"
- <= 2.0: "Estabilidade Emocional: Resiliência, calma e controle emocional"
- <= 3.0: "Estabilidade Emocional: Reatividade emocional moderada"
- <= 4.0: "Estabilidade Emocional: Maior sensibilidade emocional e reatividade ao estresse"
- > 4.0: "Estabilidade Emocional: Alta sensibilidade emocional, necessidade de apoio em situações estressantes"

## Uso
A função é executada automaticamente pelo trigger `trigger_update_analise_perfil_from_fivemind_results` que é criado na tabela `five_mind_results`.

## Segurança
A função usa `SECURITY DEFINER` para garantir que tenha permissões suficientes para atualizar a tabela `users`, mesmo quando executada por usuários comuns.

## Código SQL
```sql
CREATE OR REPLACE FUNCTION public.update_user_analise_perfil_from_fivemind_results()
RETURNS TRIGGER AS $$
DECLARE
    new_analise_perfil text[] := '{}';
BEGIN
    -- Lógica de mapeamento para cada fator...
    UPDATE public.users
    SET profile_analysis = new_analise_perfil,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Observações
- A função substitui completamente o array `profile_analysis` com as novas características
- Cada fator é sempre convertido, independente do valor
- O campo `updated_at` do usuário também é atualizado automaticamente

