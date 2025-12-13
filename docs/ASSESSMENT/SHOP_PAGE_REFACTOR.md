# Refatoração da ShopPage (Carreira)

## Visão Geral

A página Shop (Carreira) foi refatorada para focar exclusivamente em avaliações, removendo código relacionado a cursos que não estava implementado. A nova implementação segue os padrões estabelecidos no projeto, priorizando componentes modulares, server components quando possível, e design mobile-first.

## Mudanças Implementadas

### 1. Estrutura de Componentes

#### `src/app/applicant/shop/page.tsx`
- **Tipo**: Server Component (estático)
- **Responsabilidade**: Renderiza a estrutura básica da página
- **Características**:
  - Componente server-side para melhor performance
  - Importa apenas componentes necessários
  - Layout responsivo mobile-first

#### `src/components/applicant/shop/ShopHeader.tsx`
- **Tipo**: Client Component
- **Responsabilidade**: Header da página com título e descrição
- **Características**:
  - Design minimalista seguindo padrão da aplicação
  - Cores consistentes com o tema (`#5e9ea0`)
  - Responsivo com breakpoints mobile-first

#### `src/components/assessment/AssessmentsList.tsx`
- **Atualização**: Migrado de `@/contexts/auth` para `@/components/AuthClientProvider`
- **Rotas**: Atualizadas de `/candidato/marketing/avaliacoes/` para `/applicant/shop/avaliacoes/`
- **Responsabilidade**: Lista e gerencia as avaliações disponíveis

### 2. Remoções

- Código relacionado a cursos (não implementado)
- Categorias de cursos não utilizadas
- Modal de pagamento para cursos
- Filtros e busca de cursos
- Interfaces e tipos relacionados a cursos

### 3. Melhorias

- **Performance**: Página principal é server component
- **Manutenibilidade**: Código mais limpo e focado
- **Consistência**: Uso do AuthClientProvider em vez de contexto customizado
- **Rotas**: Padronização para `/applicant/shop/avaliacoes/`

## Estrutura de Arquivos

```
src/
├── app/
│   └── applicant/
│       └── shop/
│           ├── page.tsx                    # Página principal (server component)
│           └── avaliacoes/
│               └── [id]/
│                   └── page.tsx            # Página de avaliação individual (futuro)
├── components/
│   ├── applicant/
│   │   └── shop/
│   │       ├── ShopHeader.tsx              # Header da página
│   │       └── index.ts                    # Exportações
│   └── assessment/
│       ├── AssessmentsList.tsx             # Lista de avaliações (atualizado)
│       ├── AssessmentCard.tsx               # Card de avaliação
│       └── ...                             # Outros componentes de assessment
└── lib/
    └── assessment/
        ├── assessmentsConfig.ts            # Configuração das avaliações
        ├── resultsStorage.ts               # Armazenamento de resultados
        └── assessmentService.ts            # Serviço de banco de dados
```

## Fluxo de Navegação

```
ShopPage (server component)
  ↓
ShopHeader (client component)
  ↓
AssessmentsList (client component)
  ↓
AssessmentCard (client component)
  ↓
Usuário clica em "Iniciar Avaliação"
  ↓
Redireciona para /applicant/shop/avaliacoes/[id]?view=instructions
```

## Integração com Sistema de Avaliações

A ShopPage utiliza o sistema de avaliações existente:

1. **Configuração**: `assessmentsConfig.ts` define as avaliações disponíveis
2. **Armazenamento**: `resultsStorage.ts` gerencia persistência (banco + localStorage)
3. **Serviço**: `assessmentService.ts` lida com operações no banco de dados
4. **Componentes**: Componentes de assessment já existentes são reutilizados

## Autenticação

A página utiliza `AuthClientProvider` para:
- Verificar se o usuário está autenticado
- Obter ID do usuário para salvar resultados
- Verificar quais avaliações foram completadas

## Design Mobile-First

Todos os componentes seguem o padrão mobile-first:
- Breakpoints: `sm:`, `lg:` para telas maiores
- Espaçamento responsivo: `p-4 lg:p-6`
- Texto responsivo: `text-sm sm:text-base`
- Grid responsivo: `grid-cols-1 sm:grid-cols-2`

## Cores e Estilo

- **Cor principal**: `#5e9ea0` (teal)
- **Cor hover**: `#4a8b8f` (teal escuro)
- **Background**: `bg-slate-50`
- **Cards**: `bg-white` com `shadow-lg`
- **Bordas**: `border-slate-200`

## Próximos Passos

1. **Criar rotas de avaliação**: Implementar `/applicant/shop/avaliacoes/[id]/page.tsx`
2. **Tipos TypeScript**: Verificar se `@/types/assessments` existe, criar se necessário
3. **Testes**: Adicionar testes para os novos componentes
4. **Documentação SQL**: Verificar se há scripts SQL necessários

## Compatibilidade

- ✅ Next.js 15
- ✅ React 19
- ✅ TypeScript
- ✅ Supabase
- ✅ Tailwind CSS

## Referências

- [ASSESSMENTS_README.md](./ASSESSMENTS_README.md) - Guia do sistema de avaliações
- [ASSESSMENTS_DATABASE.md](./ASSESSMENTS_DATABASE.md) - Documentação do banco de dados
- [FLUXO_SALVAMENTO_ASSESSMENTS.md](./FLUXO_SALVAMENTO_ASSESSMENTS.md) - Fluxo de salvamento

