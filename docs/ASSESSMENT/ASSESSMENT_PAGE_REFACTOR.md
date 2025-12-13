# Refatoração da Página de Avaliação Individual

## Visão Geral

Este documento descreve a refatoração completa da página de avaliação individual (`/applicant/shop/assessment/[id]`), seguindo os princípios de componentização, manutenibilidade, mobile-first e integração com o banco de dados.

## Estrutura de Arquivos

### Arquivos Criados/Modificados

```
src/app/applicant/shop/assessment/[id]/
├── page.tsx                          # Página server component (estática)
└── AssessmentContent.tsx             # Componente cliente principal

src/components/applicant/shop/assessment/
├── AssessmentHeader.tsx              # Header da página de avaliação
├── AssessmentViewRouter.tsx          # Roteador de views (instructions/questionnaire/results)
└── index.ts                          # Exportações centralizadas

docs/SQL/
├── create_assessment_tables.sql       # SQL completo para tabelas e funções
└── functions/
    ├── handle_five_mind_results_updated_at.md
    ├── handle_hexa_mind_results_updated_at.md
    ├── update_user_analise_perfil_from_fivemind_results.md
    └── update_user_analise_perfil_from_hexamind_results.md
```

## Componentização

### 1. AssessmentHeader

**Localização**: `src/components/applicant/shop/assessment/AssessmentHeader.tsx`

**Responsabilidade**: Exibe o header fixo da página com título e botão de voltar.

**Props**:
- `title: string` - Título da avaliação
- `onBack: () => void` - Callback para voltar

**Características**:
- Mobile-first design
- Sticky header para melhor UX
- Acessibilidade com `aria-label`

### 2. AssessmentViewRouter

**Localização**: `src/components/applicant/shop/assessment/AssessmentViewRouter.tsx`

**Responsabilidade**: Roteia as diferentes views da avaliação baseado no `assessmentId` e `currentView`.

**Props**:
- `assessmentId: string` - ID da avaliação (five-mind ou hexa-mind)
- `currentView: AssessmentView` - View atual (instructions/questionnaire/results)
- `results: AssessmentResult | null` - Resultados da avaliação
- `assessmentImage?: string` - Imagem da avaliação
- `onStart: () => void` - Callback para iniciar questionário
- `onComplete: (result: AssessmentResult) => void` - Callback ao completar
- `onRestart: () => void` - Callback para reiniciar
- `onCancel: () => void` - Callback para cancelar

**Características**:
- Centraliza toda a lógica de roteamento de views
- Suporta FiveMind e HexaMind
- Facilita adicionar novas avaliações no futuro

### 3. AssessmentContent

**Localização**: `src/app/applicant/shop/assessment/[id]/AssessmentContent.tsx`

**Responsabilidade**: Gerencia o estado e orquestra os componentes da página de avaliação.

**Funcionalidades**:
- Carrega avaliação baseado no ID da URL
- Gerencia estado de view (instructions/questionnaire/results)
- Carrega resultados existentes do banco de dados
- Salva resultados usando `resultsStorage`
- Integra com `AuthClientProvider` para autenticação

**Fluxo de Dados**:
1. Carrega avaliação do `assessmentsConfig`
2. Verifica se há view na URL (`?view=...`)
3. Busca resultado mais recente no banco de dados
4. Se resultado existe e não há view na URL, mostra resultados
5. Ao completar, salva usando `saveResults()` que:
   - Salva em `assessment_results` (tabela geral)
   - Salva em `five_mind_results` ou `hexa_mind_results` (tabela específica)
   - Trigger atualiza `users.profile_analysis` automaticamente

## Rotas

### Rotas Antigas (Removidas)
- `/candidato/marketing/avaliacoes/[id]`

### Rotas Novas
- `/applicant/shop/assessment/[id]` - Página principal
- `/applicant/shop/assessment/[id]?view=instructions` - Instruções
- `/applicant/shop/assessment/[id]?view=questionnaire` - Questionário
- `/applicant/shop/assessment/[id]?view=results` - Resultados

## Integração com Banco de Dados

### Salvamento de Resultados

O salvamento é feito através de `resultsStorage.saveResults()`, que:

1. **Tenta salvar no banco de dados** (se usuário autenticado):
   - Chama `saveAssessmentResult()` que:
     - Salva em `assessment_results` (tabela geral)
     - Se FiveMind: salva em `five_mind_results` (tabela específica)
     - Se HexaMind: salva em `hexa_mind_results` (tabela específica)
     - Triggers atualizam `users.profile_analysis` automaticamente

2. **Fallback para localStorage** (se não autenticado ou erro):
   - Salva no localStorage como backup
   - Pode ser sincronizado depois quando usuário autenticar

### Carregamento de Resultados

O carregamento é feito através de `resultsStorage.getLatestResult()`, que:

1. **Tenta buscar no banco de dados** (se usuário autenticado):
   - Busca resultado mais recente da tabela específica
   - Retorna resultado formatado

2. **Fallback para localStorage** (se não autenticado ou erro):
   - Busca no localStorage
   - Retorna resultado mais recente

## Mobile-First Design

### Responsividade

- **Mobile (< 640px)**:
  - Padding reduzido (`p-3 sm:p-4`)
  - Texto menor (`text-base sm:text-lg`)
  - Ícones menores (`w-4 h-4 sm:w-5 sm:h-5`)

- **Tablet/Desktop (>= 640px)**:
  - Padding aumentado (`p-4 lg:p-6`)
  - Texto maior (`text-lg lg:text-xl`)
  - Ícones maiores

### UX Mobile

- Header sticky para fácil navegação
- Botões com área de toque adequada
- Loading states claros
- Feedback visual em todas as ações

## Autenticação

A página usa `AuthClientProvider` para:

- Obter usuário autenticado
- Verificar estado de loading
- Garantir que apenas usuários autenticados salvem resultados

```typescript
const { user, loading: authLoading } = useAuth();
```

## Melhorias Implementadas

### 1. Componentização
- ✅ Código dividido em componentes reutilizáveis
- ✅ Separação de responsabilidades clara
- ✅ Facilita manutenção e testes

### 2. Manutenibilidade
- ✅ Código limpo e bem documentado
- ✅ Tipos TypeScript para type safety
- ✅ Funções pequenas e focadas

### 3. Mobile-First
- ✅ Design responsivo em todos os componentes
- ✅ UX otimizada para mobile
- ✅ Performance otimizada

### 4. Integração com Banco de Dados
- ✅ Salvamento automático em múltiplas tabelas
- ✅ Triggers atualizam `profile_analysis` automaticamente
- ✅ Fallback para localStorage

### 5. Rotas Corrigidas
- ✅ Rotas atualizadas para `/applicant/shop/assessment/[id]`
- ✅ Suporte a query params para views
- ✅ Navegação fluida entre views

## Próximos Passos

1. Adicionar testes unitários para componentes
2. Adicionar testes de integração para fluxo completo
3. Implementar sincronização de localStorage com banco
4. Adicionar analytics para tracking de conclusões

## Referências

- [Documentação SQL](./docs/SQL/create_assessment_tables.sql)
- [Documentação de Funções SQL](./docs/SQL/functions/)
- [Documentação do Sistema de Avaliações](./ASSESSMENTS_README.md)

