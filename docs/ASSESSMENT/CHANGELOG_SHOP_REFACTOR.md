# Changelog - Refatoração ShopPage

## Data: 2025-01-XX

### Resumo

Refatoração completa da página Shop (Carreira) para focar exclusivamente em avaliações, removendo código não implementado relacionado a cursos e seguindo os padrões estabelecidos no projeto.

### Arquivos Criados

1. **`src/app/applicant/shop/page.tsx`**
   - Server component estático
   - Renderiza estrutura básica da página
   - Importa componentes modulares

2. **`src/components/applicant/shop/ShopHeader.tsx`**
   - Client component para header
   - Design minimalista e responsivo
   - Cores consistentes com o tema

3. **`src/components/applicant/shop/index.ts`**
   - Exportações centralizadas

4. **`docs/ASSESSMENT/SHOP_PAGE_REFACTOR.md`**
   - Documentação completa da refatoração

5. **`docs/ASSESSMENT/CHANGELOG_SHOP_REFACTOR.md`**
   - Este arquivo

### Arquivos Modificados

1. **`src/components/assessment/AssessmentsList.tsx`**
   - Migrado de `@/contexts/auth` para `@/components/AuthClientProvider`
   - Rotas atualizadas de `/candidato/marketing/avaliacoes/` para `/applicant/shop/avaliacoes/`
   - Import corrigido de `@/lib/assessments/` para `@/lib/assessment/`

### Arquivos Removidos

- Código relacionado a cursos (interfaces, tipos, componentes)
- Modal de pagamento para cursos
- Filtros e busca de cursos
- Categorias não utilizadas

### Melhorias

- ✅ Código mais limpo e focado
- ✅ Melhor performance (server components)
- ✅ Manutenibilidade aumentada
- ✅ Consistência com padrões do projeto
- ✅ Mobile-first design
- ✅ TypeScript sem erros

### Breaking Changes

- **Rotas de avaliações**: Mudaram de `/candidato/marketing/avaliacoes/` para `/applicant/shop/avaliacoes/`
  - **Ação necessária**: Atualizar links e redirecionamentos que usam a rota antiga

### Próximos Passos

1. Criar rotas de avaliação individual: `/applicant/shop/avaliacoes/[id]/page.tsx`
2. Verificar/criar tipos TypeScript em `@/types/assessments`
3. Verificar se há scripts SQL necessários em `docs/sql/`
4. Testar fluxo completo de avaliações

### Compatibilidade

- ✅ Next.js 15
- ✅ React 19
- ✅ TypeScript
- ✅ Supabase
- ✅ Tailwind CSS 4

### Notas Técnicas

- A página principal é um server component para melhor performance
- Componentes client são usados apenas quando necessário (interatividade)
- Autenticação usa `AuthClientProvider` em vez de contexto customizado
- Design segue padrão mobile-first com breakpoints responsivos

