# Documentação do Sistema de Avaliações - Banco de Dados

## Visão Geral

Este documento descreve a implementação do sistema de avaliações com persistência no banco de dados Supabase. O sistema permite que os usuários realizem avaliações (como o FiveMind) e tenha seus resultados salvos no banco de dados, com atualização automática do campo `analise_perfil` na tabela `users`.

**Importante**: Para o FiveMind, os resultados são salvos em uma tabela específica (`five_mind_results`) que possui estrutura tipada e trigger dedicado. Veja `docs/FIVE_MIND_DATABASE.md` para detalhes.

## Estrutura do Banco de Dados

### Tabela: `assessment_results`

Armazena todos os resultados das avaliações realizadas pelos usuários.

#### Colunas

- `id` (UUID, PK): Identificador único do resultado
- `user_id` (UUID, FK): Referência ao usuário que realizou a avaliação
- `assessment_id` (VARCHAR): ID da avaliação (ex: 'five-mind')
- `assessment_name` (VARCHAR): Nome da avaliação
- `results` (JSONB): Resultados da avaliação em formato JSON
- `score` (DECIMAL): Score geral da avaliação (0-100, opcional)
- `completed_at` (TIMESTAMP): Data e hora de conclusão
- `created_at` (TIMESTAMP): Data de criação do registro
- `updated_at` (TIMESTAMP): Data da última atualização

#### Índices

- `idx_assessment_results_user_id`: Índice B-tree em `user_id`
- `idx_assessment_results_assessment_id`: Índice B-tree em `assessment_id`
- `idx_assessment_results_completed_at`: Índice B-tree em `completed_at` (DESC)
- `idx_assessment_results_user_assessment`: Índice composto em `(user_id, assessment_id)`
- `idx_assessment_results_results_gin`: Índice GIN para busca em JSONB

### Trigger: Atualização de `analise_perfil`

Quando um resultado do FiveMind é inserido, um trigger automaticamente atualiza o campo `analise_perfil` do usuário na tabela `users` com base nos scores obtidos.

#### Lógica de Mapeamento

- **Abertura à Experiência (Openness >= 4.0)**: Adiciona "Criativo e Inovador"
- **Conscienciosidade (Conscientiousness >= 4.0)**: Adiciona "Organizado e Disciplinado"
- **Extroversão (Extraversion >= 4.0)**: Adiciona "Comunicativo e Sociável"
- **Amabilidade (Agreeableness >= 4.0)**: Adiciona "Empático e Colaborativo"
- **Estabilidade Emocional (Neuroticism <= 2.0)**: Adiciona "Resiliente e Estável"

## Arquitetura de Código

### Serviços

#### `assessmentService.ts`

Serviço principal para interação com o banco de dados. Fornece funções para:

- `saveAssessmentResult()`: Salva um resultado no banco
- `getAssessmentResultsByUser()`: Busca todos os resultados de um usuário
- `getAssessmentResultsByAssessment()`: Busca resultados de uma avaliação específica
- `getLatestAssessmentResult()`: Busca o resultado mais recente
- `convertRowToAssessmentResult()`: Converte linha do banco para tipo TypeScript
- `convertRowToFiveMindResult()`: Converte linha do banco para FiveMindResult

#### `resultsStorage.ts`

Camada de abstração que combina armazenamento no banco de dados e localStorage como fallback. Funções principais:

- `saveResults()`: Salva resultado (prioriza banco, fallback localStorage)
- `getStoredResults()`: Busca todos os resultados
- `getResultsByAssessment()`: Busca resultados de uma avaliação
- `getLatestResult()`: Busca resultado mais recente

### Componentes

#### `AssessmentContent.tsx`

Componente principal da página de avaliação. Gerencia:

- Carregamento de resultados do banco de dados
- Navegação entre views (instructions, questionnaire, results)
- Salvamento de resultados ao completar avaliação

#### `AssessmentsList.tsx`

Lista de avaliações disponíveis. Verifica quais foram completadas consultando o banco de dados.

## Fluxo de Dados

### 1. Iniciar Avaliação

```
Usuário clica em "Iniciar Avaliação"
  ↓
AssessmentsList verifica se há resultado no banco
  ↓
Redireciona para /avaliacoes/[id]?view=instructions
```

### 2. Completar Avaliação

```
Usuário completa questionário
  ↓
handleComplete() é chamado
  ↓
saveResults() salva no banco de dados
  ↓
Trigger atualiza users.analise_perfil automaticamente
  ↓
Redireciona para view=results
```

### 3. Visualizar Resultados

```
AssessmentContent carrega resultado mais recente do banco
  ↓
Exibe resultados na tela
```

## Instalação

### 1. Executar Script SQL

Execute o script `docs/sql/assessments_tables.sql` no Supabase SQL Editor:

```sql
-- Copiar e colar o conteúdo do arquivo
```

### 2. Verificar Permissões RLS

Certifique-se de que as políticas RLS (Row Level Security) estão configuradas:

```sql
-- Exemplo de política para usuários verem apenas seus próprios resultados
CREATE POLICY "Users can view their own assessment results"
ON assessment_results FOR SELECT
USING (auth.uid() = user_id);

-- Exemplo de política para usuários inserirem seus próprios resultados
CREATE POLICY "Users can insert their own assessment results"
ON assessment_results FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Uso

### Salvar Resultado

```typescript
import { saveResults } from '@/lib/assessments/resultsStorage';
import { useAuth } from '@/contexts/auth';

const { user } = useAuth();
const result: AssessmentResult = {
    assessmentId: 'five-mind',
    assessmentName: 'FiveMind',
    completedAt: new Date(),
    results: { /* ... */ }
};

await saveResults(user?.id || null, result);
```

### Buscar Resultados

```typescript
import { getLatestResult } from '@/lib/assessments/resultsStorage';

const latestResult = await getLatestResult('five-mind', user?.id || null);
```

## Fallback para localStorage

O sistema mantém compatibilidade com localStorage para:

- Usuários não autenticados
- Casos de erro na conexão com o banco
- Desenvolvimento offline

Quando o usuário fizer login, os resultados do localStorage podem ser migrados para o banco (funcionalidade futura).

## Manutenção

### Adicionar Nova Avaliação

1. Adicionar configuração em `assessmentsConfig.ts`
2. Criar componente de questionário
3. Criar componente de resultados
4. Atualizar trigger SQL se necessário para mapear resultados para `analise_perfil`

### Modificar Lógica de `analise_perfil`

Editar a função `update_user_analise_perfil_from_fivemind()` no arquivo SQL:

```sql
-- Modificar condições e textos conforme necessário
```

## Troubleshooting

### Resultados não aparecem

1. Verificar se o usuário está autenticado
2. Verificar políticas RLS no Supabase
3. Verificar console do navegador para erros
4. Verificar se o trigger está funcionando

### `analise_perfil` não atualiza

1. Verificar se o trigger está criado
2. Verificar logs do Supabase
3. Verificar se `assessment_id` é 'five-mind'
4. Verificar formato do JSON em `results`

## Performance

- Índices otimizados para consultas frequentes
- Índice GIN para busca em JSONB
- Consultas paginadas quando necessário
- Cache local (localStorage) para reduzir chamadas ao banco

## Segurança

- RLS (Row Level Security) para isolar dados por usuário
- Validação de tipos no TypeScript
- Sanitização de dados antes de inserir no banco
- Triggers validam dados antes de atualizar `analise_perfil`

