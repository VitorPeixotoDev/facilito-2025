# Documentação - Tabela FiveMind Results

## Visão Geral

O sistema de avaliações FiveMind agora utiliza uma tabela específica (`five_mind_results`) para armazenar os resultados detalhados do teste. Esta abordagem oferece:

1. **Estrutura tipada**: Colunas específicas para cada fator do Big Five
2. **Performance**: Consultas mais rápidas com índices otimizados
3. **Integridade**: Constraints que garantem valores válidos (1.0 a 5.0)
4. **Histórico**: Permite rastrear múltiplas avaliações do mesmo usuário
5. **Atualização automática**: Trigger atualiza `users.analise_perfil` automaticamente

## Estrutura da Tabela

### Tabela: `five_mind_results`

#### Colunas

| Coluna | Tipo | Descrição | Constraints |
|--------|------|-----------|-------------|
| `id` | UUID | Identificador único | PRIMARY KEY |
| `user_id` | UUID | ID do usuário | FK → users.id, NOT NULL |
| `openness` | DECIMAL(3,1) | Score de Abertura à Experiência | 1.0 a 5.0, NOT NULL |
| `conscientiousness` | DECIMAL(3,1) | Score de Conscienciosidade | 1.0 a 5.0, NOT NULL |
| `extraversion` | DECIMAL(3,1) | Score de Extroversão | 1.0 a 5.0, NOT NULL |
| `agreeableness` | DECIMAL(3,1) | Score de Amabilidade | 1.0 a 5.0, NOT NULL |
| `neuroticism` | DECIMAL(3,1) | Score de Neuroticismo | 1.0 a 5.0, NOT NULL |
| `overall_score` | DECIMAL(4,2) | Score geral da avaliação | NULLABLE |
| `completed_at` | TIMESTAMP | Data de conclusão | NOT NULL, DEFAULT now() |
| `created_at` | TIMESTAMP | Data de criação | NOT NULL, DEFAULT now() |
| `updated_at` | TIMESTAMP | Data de atualização | NULLABLE |

#### Índices

- `idx_five_mind_results_user_id`: Busca por usuário
- `idx_five_mind_results_completed_at`: Ordenação por data
- `idx_five_mind_results_user_completed`: Busca combinada (user + data)

## Fluxo de Dados

### 1. Usuário Completa a Avaliação

```
FiveMindQuestionnaire calcula resultados
  ↓
handleComplete() é chamado
  ↓
saveResults() → saveAssessmentResult()
  ↓
Salva em assessment_results (compatibilidade)
  ↓
Salva em five_mind_results (tabela específica)
  ↓
Trigger executa automaticamente
  ↓
users.analise_perfil é atualizado
```

### 2. Mapeamento Completo de Scores para `analise_perfil`

O trigger `trigger_update_analise_perfil_from_fivemind_results` converte **TODOS** os valores numéricos (1.0-5.0) para características de personalidade descritivas em texto. Cada fator é sempre convertido, independente do valor.

#### Openness (Abertura à Experiência)
| Faixa de Score | Característica de Personalidade |
|----------------|----------------------------------|
| >= 4.5 | "Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias" |
| >= 4.0 | "Abertura à Experiências: Criatividade, curiosidade e abertura a novas ideias" |
| >= 3.0 | "Abertura à Experiências: Abertura moderada a experiências novas" |
| >= 2.0 | "Abertura à Experiências: Preferência por rotinas e estabilidade" |
| < 2.0 | "Abertura à Experiências: Forte preferência por rotinas, pouca abertura a mudanças" |

#### Conscientiousness (Conscienciosidade)
| Faixa de Score | Característica de Personalidade |
|----------------|----------------------------------|
| >= 4.5 | "Conscienciosidade: Muito alta organização, disciplina exemplar e extrema responsabilidade" |
| >= 4.0 | "Conscienciosidade: Organização, disciplina e responsabilidade" |
| >= 3.0 | "Conscienciosidade: Nível moderado de organização e planejamento" |
| >= 2.0 | "Conscienciosidade: Preferência por flexibilidade e espontaneidade" |
| < 2.0 | "Conscienciosidade: Alta flexibilidade, baixa necessidade de estrutura" |

#### Extraversion (Extroversão)
| Faixa de Score | Característica de Personalidade |
|----------------|----------------------------------|
| >= 4.5 | "Extroversão: Muito alta sociabilidade, assertividade elevada e energia intensa" |
| >= 4.0 | "Extroversão: Sociabilidade, assertividade e energia" |
| >= 3.0 | "Extroversão: Equilíbrio entre sociabilidade e momentos de introspecção" |
| >= 2.0 | "Extroversão: Preferência por ambientes mais reservados e grupos pequenos" |
| < 2.0 | "Extroversão: Alto nível de introversão, prefere atividades solitárias" |

#### Agreeableness (Amabilidade)
| Faixa de Score | Característica de Personalidade |
|----------------|----------------------------------|
| >= 4.5 | "Amabilidade: Muito alta empatia, cooperação exemplar e grande confiança nos outros" |
| >= 4.0 | "Amabilidade: Empatia, cooperação e confiança" |
| >= 3.0 | "Amabilidade: Nível moderado de empatia e disposição para colaborar" |
| >= 2.0 | "Amabilidade: Tendência a ser mais direto e menos complacente" |
| < 2.0 | "Amabilidade: Alta assertividade, preferência por competição sobre cooperação" |

#### Neuroticism (Estabilidade Emocional)
**Nota**: Para Neuroticism, valores BAIXOS indicam ESTABILIDADE (positivo) e valores ALTOS indicam INSTABILIDADE.

| Faixa de Score | Característica de Personalidade |
|----------------|----------------------------------|
| <= 1.5 | "Estabilidade Emocional: Muito alta resiliência, extrema calma e excelente controle emocional" |
| <= 2.0 | "Estabilidade Emocional: Resiliência, calma e controle emocional" |
| <= 3.0 | "Estabilidade Emocional: Reatividade emocional moderada" |
| <= 4.0 | "Estabilidade Emocional: Maior sensibilidade emocional e reatividade ao estresse" |
| > 4.0 | "Estabilidade Emocional: Alta sensibilidade emocional, necessidade de apoio em situações estressantes" |

## Instalação

### 1. Executar Script SQL Base

Execute o script `docs/sql/five_mind_results_table.sql` no Supabase SQL Editor para criar a tabela e estrutura inicial.

### 2. Executar Script de Conversão Completa e RLS

Execute o script `docs/sql/five_mind_results_complete_conversion_rls.sql` no Supabase SQL Editor para:
- Atualizar a função de conversão completa (mapeia TODOS os valores numéricos)
- Implementar políticas RLS (Row Level Security)

Este script inclui:
- Função atualizada que converte todos os scores (1.0-5.0) em características textuais
- 4 políticas RLS:
  - **SELECT**: Usuários podem visualizar apenas seus próprios resultados
  - **INSERT**: Usuários podem inserir apenas seus próprios resultados
  - **UPDATE**: Usuários podem atualizar apenas seus próprios resultados
  - **DELETE**: Usuários podem deletar apenas seus próprios resultados

### 3. Verificar Instalação

Execute as consultas de verificação no final do script `five_mind_results_complete_conversion_rls.sql` para confirmar:
- Políticas RLS criadas corretamente
- RLS habilitado na tabela
- Função atualizada

## Uso no Código

### Salvar Resultado

```typescript
import { saveAssessmentResult } from '@/lib/assessments/assessmentService';
import { useAuth } from '@/contexts/auth';

const { user } = useAuth();
const result: FiveMindResult = {
    assessmentId: 'five-mind',
    assessmentName: 'FiveMind',
    completedAt: new Date(),
    results: {
        openness: 4.2,
        conscientiousness: 3.8,
        extraversion: 4.5,
        agreeableness: 4.0,
        neuroticism: 2.1,
        overallScore: 4.1
    }
};

await saveAssessmentResult(user?.id || '', result);
// Automaticamente salva em ambas as tabelas e atualiza analise_perfil
```

### Buscar Resultados

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();
const { data } = await supabase
    .from('five_mind_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
```

## Verificação

### Verificar se os dados foram salvos

```sql
-- Verificar último resultado inserido
SELECT * FROM five_mind_results
ORDER BY completed_at DESC
LIMIT 1;

-- Verificar se analise_perfil foi atualizado
SELECT id, full_name, analise_perfil
FROM users
WHERE id = 'SEU_USER_ID';
```

### Verificar se o trigger está funcionando

```sql
-- Verificar trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_analise_perfil_from_fivemind_results';

-- Verificar função
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_name = 'update_user_analise_perfil_from_fivemind_results';
```

### Verificar Políticas RLS

```sql
-- Listar todas as políticas RLS da tabela
SELECT 
    policyname,
    cmd AS operation,
    roles,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'five_mind_results'
ORDER BY cmd, policyname;

-- Verificar se RLS está habilitado
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'five_mind_results';
```

## Troubleshooting

### Resultados não aparecem em `analise_perfil`

1. Verifique se o trigger existe e está ativo
2. Verifique se a função tem `SECURITY DEFINER`
3. Verifique os logs do Supabase para erros
4. Execute o script de debug: `docs/sql/debug_assessment_trigger.sql`

### Erro ao inserir na tabela

1. Verifique se as políticas RLS estão configuradas (execute as queries de verificação)
2. Verifique se os valores estão no range 1.0-5.0
3. Verifique se o `user_id` existe na tabela `users`
4. Verifique se o usuário está autenticado (`auth.uid()` deve retornar o ID do usuário)

### Erro de permissão RLS

Se você receber erros de permissão ao tentar inserir/ler/atualizar:

1. Certifique-se de que executou o script `five_mind_results_complete_conversion_rls.sql`
2. Verifique se `auth.uid()` retorna o ID do usuário correto
3. Verifique se o `user_id` no INSERT/UPDATE corresponde ao `auth.uid()`
4. Em desenvolvimento, você pode temporariamente desabilitar RLS (não recomendado em produção):
   ```sql
   ALTER TABLE public.five_mind_results DISABLE ROW LEVEL SECURITY;
   ```

## Segurança (RLS - Row Level Security)

A tabela `five_mind_results` possui políticas RLS implementadas que garantem:

- ✅ **Privacidade**: Usuários só podem acessar seus próprios resultados
- ✅ **Integridade**: Usuários só podem inserir/atualizar/deletar seus próprios resultados
- ✅ **Isolamento**: Dados de um usuário não são acessíveis por outros usuários
- ✅ **Compliance**: Atende requisitos de proteção de dados pessoais

A função de atualização usa `SECURITY DEFINER`, permitindo que ela atualize o campo `analise_perfil` mesmo com RLS ativo, mas apenas através do trigger controlado.

## Vantagens desta Abordagem

1. **Separação de responsabilidades**: Tabela específica para cada tipo de avaliação
2. **Tipagem forte**: Colunas específicas garantem integridade
3. **Performance**: Consultas mais rápidas sem precisar parsear JSONB
4. **Escalabilidade**: Fácil adicionar novas avaliações com suas próprias tabelas
5. **Manutenibilidade**: Código mais limpo e fácil de entender
6. **Conversão completa**: Todos os valores numéricos são convertidos em características descritivas
7. **Segurança**: Políticas RLS garantem privacidade e integridade dos dados

## Próximos Passos

Para adicionar novas avaliações:

1. Criar tabela específica (ex: `other_assessment_results`)
2. Criar função de atualização de `analise_perfil` específica
3. Criar trigger correspondente
4. Atualizar `assessmentService.ts` para salvar na nova tabela

