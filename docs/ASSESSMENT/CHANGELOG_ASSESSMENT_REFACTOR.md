# Changelog - Refatoração da Página de Avaliação

## Data: 2025-01-XX

## Resumo

Refatoração completa da página de avaliação individual seguindo os princípios de componentização, manutenibilidade, mobile-first e integração com banco de dados.

## Mudanças Principais

### 1. Estrutura de Arquivos

#### Criados
- `src/components/applicant/shop/assessment/AssessmentHeader.tsx`
- `src/components/applicant/shop/assessment/AssessmentViewRouter.tsx`
- `src/components/applicant/shop/assessment/index.ts`
- `docs/SQL/create_assessment_tables.sql`
- `docs/SQL/functions/handle_five_mind_results_updated_at.md`
- `docs/SQL/functions/handle_hexa_mind_results_updated_at.md`
- `docs/SQL/functions/update_user_analise_perfil_from_fivemind_results.md`
- `docs/SQL/functions/update_user_analise_perfil_from_hexamind_results.md`
- `docs/ASSESSMENT/ASSESSMENT_PAGE_REFACTOR.md`

#### Modificados
- `src/app/applicant/shop/assessment/[id]/AssessmentContent.tsx` - Refatorado completamente
- `src/app/applicant/shop/assessment/[id]/page.tsx` - Simplificado

### 2. Componentização

#### Antes
- Tudo em um único arquivo `AssessmentContent.tsx` (253 linhas)
- Lógica de roteamento misturada com lógica de estado
- Difícil manutenção e testes

#### Depois
- **AssessmentHeader**: Componente isolado para header
- **AssessmentViewRouter**: Componente isolado para roteamento de views
- **AssessmentContent**: Focado apenas em gerenciamento de estado
- Código mais limpo, testável e manutenível

### 3. Rotas

#### Antes
- `/candidato/marketing/avaliacoes/[id]`

#### Depois
- `/applicant/shop/assessment/[id]`
- Suporte a query params: `?view=instructions|questionnaire|results`

### 4. Autenticação

#### Antes
- Usava `useAuth` de `@/contexts/auth`
- Usava `createClientComponentClient` do `@supabase/auth-helpers-nextjs`

#### Depois
- Usa `useAuth` de `@/components/AuthClientProvider`
- Usa `createClient` de `@/utils/supabase/client`
- Melhor integração com o sistema de autenticação da aplicação

### 5. Salvamento de Resultados

#### Antes
- Chamava diretamente `saveFiveMindToDatabase` ou `saveHexaMindToDatabase`
- Lógica duplicada para cada tipo de avaliação

#### Depois
- Usa `saveResults` de `resultsStorage`
- Abstração que salva em `assessment_results` e tabelas específicas automaticamente
- Fallback para localStorage se não autenticado

### 6. Banco de Dados

#### SQL Criado
- Tabela `five_mind_results` com todas as constraints e índices
- Tabela `hexa_mind_results` com todas as constraints e índices
- Funções SQL:
  - `handle_five_mind_results_updated_at()` - Atualiza `updated_at`
  - `handle_hexa_mind_results_updated_at()` - Atualiza `updated_at`
  - `update_user_analise_perfil_from_fivemind_results()` - Atualiza `profile_analysis`
  - `update_user_analise_perfil_from_hexamind_results()` - Atualiza `profile_analysis`
- Triggers para execução automática
- Políticas RLS (Row Level Security) para ambas as tabelas

### 7. Mobile-First

#### Melhorias
- Padding responsivo (`p-3 sm:p-4` para mobile, `p-4 lg:p-6` para desktop)
- Texto responsivo (`text-base sm:text-lg lg:text-xl`)
- Ícones responsivos (`w-4 h-4 sm:w-5 sm:h-5`)
- Header sticky para melhor navegação
- Área de toque adequada em botões

## Detalhes Técnicos

### Componentes Criados

#### AssessmentHeader
```typescript
interface AssessmentHeaderProps {
    title: string;
    onBack: () => void;
}
```

#### AssessmentViewRouter
```typescript
interface AssessmentViewRouterProps {
    assessmentId: string;
    currentView: AssessmentView;
    results: AssessmentResult | null;
    assessmentImage?: string;
    onStart: () => void;
    onComplete: (result: AssessmentResult) => void;
    onRestart: () => void;
    onCancel: () => void;
}
```

### Fluxo de Dados

1. **Carregamento**:
   - `AssessmentContent` carrega avaliação do `assessmentsConfig`
   - Verifica view na URL
   - Busca resultado mais recente via `getLatestResult()`

2. **Completar Avaliação**:
   - `handleComplete()` recebe resultados
   - Chama `saveResults()` que:
     - Salva em `assessment_results`
     - Salva em tabela específica (`five_mind_results` ou `hexa_mind_results`)
     - Trigger atualiza `users.profile_analysis` automaticamente

### Políticas RLS

Ambas as tabelas têm 4 políticas RLS:
- **SELECT**: Usuários podem ver apenas seus próprios resultados
- **INSERT**: Usuários podem inserir apenas seus próprios resultados
- **UPDATE**: Usuários podem atualizar apenas seus próprios resultados
- **DELETE**: Usuários podem deletar apenas seus próprios resultados

## Breaking Changes

### Rotas
- Rotas antigas (`/candidato/marketing/avaliacoes/[id]`) não funcionam mais
- Usar novas rotas (`/applicant/shop/assessment/[id]`)

### Imports
- `@/contexts/auth` → `@/components/AuthClientProvider`
- `@supabase/auth-helpers-nextjs` → `@/utils/supabase/client`

## Melhorias de Performance

- Componentização reduz re-renders desnecessários
- Suspense para melhor loading states
- Lazy loading de componentes de avaliação

## Próximos Passos

1. ✅ SQL completo criado
2. ✅ Componentização implementada
3. ✅ Rotas corrigidas
4. ✅ Integração com banco de dados
5. ✅ Documentação criada
6. ⏳ Testes unitários (futuro)
7. ⏳ Testes de integração (futuro)
8. ⏳ Sincronização localStorage → banco (futuro)

## Referências

- [Documentação da Refatoração](./ASSESSMENT_PAGE_REFACTOR.md)
- [SQL das Tabelas](../SQL/create_assessment_tables.sql)
- [Documentação de Funções SQL](../SQL/functions/)

