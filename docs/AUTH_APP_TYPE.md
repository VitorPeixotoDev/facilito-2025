# Sistema de Tipagem de Aplicação (app_type)

## Visão Geral

Este documento descreve a implementação do sistema de tipagem de aplicação que permite diferenciar entre a aplicação A (recruiter) e a aplicação B (usuários finais) usando o mesmo projeto Supabase.

## Arquitetura

### Separação de Aplicações

- **Aplicação A (Recruiter)**: Usa `user_metadata.app_type = 'recruiter'`
- **Aplicação B (Usuários)**: Usa `user_metadata.app_type = 'user'`

Ambas as aplicações compartilham o mesmo projeto Supabase, mas são completamente isoladas em termos de acesso.

## Implementação

### 1. Utilitários de Verificação

**Arquivo**: `src/utils/auth/appType.ts`

Funções auxiliares para verificar o tipo de aplicação:

```typescript
isValidUserApp(user): boolean  // Verifica se app_type === 'user'
isOtherAppUser(user): boolean  // Verifica se app_type existe e é diferente de 'user'
```

### 2. Cadastro (SignUp)

**Arquivo**: `src/app/login/actions.ts`

Ao criar usuário, automaticamente define `app_type = 'user'`:

```typescript
await supabase.auth.signUp({
    email,
    password,
    options: {
        emailRedirectTo: `${getURL()}auth/callback`,
        data: {
            app_type: 'user',
        },
    },
})
```

### 3. Login (Email/Senha)

**Arquivo**: `src/app/login/actions.ts`

Após login bem-sucedido, verifica `app_type`:

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (user && user.user_metadata?.app_type && user.user_metadata.app_type !== 'user') {
    await supabase.auth.signOut({ scope: 'global' })
    throw new Error('Esta conta pertence a outra aplicação e não pode acessar este painel.')
}
```

### 4. Login via OAuth (Google, etc.)

**Arquivo**: `src/app/auth/callback/route.ts`

No callback OAuth:

1. Verifica se `app_type` existe e é diferente de 'user' → faz signOut
2. Se `app_type` não existe, adiciona `app_type = 'user'` automaticamente

```typescript
if (user.user_metadata?.app_type && user.user_metadata.app_type !== 'user') {
    await supabase.auth.signOut({ scope: 'global' })
    return NextResponse.redirect(`${origin}/login?error=app_type_mismatch`)
}

if (!user.user_metadata?.app_type) {
    await supabase.auth.updateUser({
        data: {
            ...user.user_metadata,
            app_type: 'user',
        },
    })
}
```

### 5. Proteção de Rotas (Middleware)

**Arquivo**: `src/utils/supabase/middleware.ts`

O middleware verifica `app_type` em todas as requisições:

```typescript
const { data: { user } } = await supabase.auth.getUser()

const isProtectedRoute = pathname.startsWith('/applicant') || pathname.startsWith('/auth/reset-password')

if (user && isProtectedRoute && !isValidUserApp(user)) {
    await supabase.auth.signOut({ scope: 'global' })
    return NextResponse.redirect('/login?error=app_type_mismatch')
}
```

### 6. Server Components

Todas as páginas protegidas verificam `app_type`:

**Exemplo**: `src/app/applicant/page.tsx`

```typescript
if (!user || !isValidUserApp(user)) {
    redirect('/login')
}
```

Páginas atualizadas:
- `src/app/applicant/page.tsx`
- `src/app/applicant/vacancies/page.tsx`
- `src/app/login/page.tsx`
- `src/app/page.tsx`

## Migração de Usuários Existentes

### Script SQL

**Arquivo**: `docs/SQL/migrate_existing_users_app_type.sql`

Execute este script **APENAS UMA VEZ** após implementar a feature:

```sql
UPDATE auth.users
SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb)
    || jsonb_build_object('app_type', 'user')
WHERE raw_user_meta_data->>'app_type' IS NULL;
```

Este script marca como `'user'` todos os usuários existentes que ainda não têm `app_type` definido.

## Fluxo de Autenticação

### Novo Usuário (SignUp)

1. Usuário cria conta → `app_type: 'user'` é definido automaticamente
2. Confirma email → mantém `app_type: 'user'`
3. Login → verificação passa, acesso permitido

### Usuário Existente (Login)

1. Usuário faz login
2. Sistema verifica `app_type`
3. Se `app_type === 'user'` → acesso permitido
4. Se `app_type !== 'user'` → signOut + erro "Esta conta pertence a outra aplicação..."

### Usuário OAuth (Google, etc.)

1. Primeiro login OAuth → `app_type` não existe
2. Sistema adiciona `app_type: 'user'` automaticamente
3. Login subsequente → verificação passa normalmente

### Tentativa de Acesso com Conta de Outra App

1. Usuário da App A (recruiter) tenta acessar App B
2. Middleware detecta `app_type = 'recruiter'`
3. Faz signOut automaticamente
4. Redireciona para `/login?error=app_type_mismatch`
5. Exibe mensagem: "Esta conta pertence a outra aplicação e não pode acessar este painel."

## Segurança

### Pontos de Proteção

1. **Cadastro**: Define `app_type` automaticamente
2. **Login**: Verifica antes de permitir acesso
3. **OAuth Callback**: Verifica e corrige se necessário
4. **Middleware**: Bloqueia acesso a rotas protegidas
5. **Server Components**: Verificação dupla nas páginas

### Isolamento

- Usuários da App A **nunca** conseguem acessar a App B
- Mesmo com autenticação válida, são bloqueados
- SignOut automático previne tentativas de bypass

## Troubleshooting

### Usuário não consegue fazer login

**Sintoma**: Erro "Esta conta pertence a outra aplicação..."

**Causa**: Usuário foi criado na App A (recruiter)

**Solução**: Usuário deve usar a App A para acessar sua conta, ou criar nova conta na App B

### Usuário OAuth não tem app_type

**Sintoma**: Funciona normalmente

**Causa**: Primeiro login via OAuth

**Solução**: Sistema adiciona automaticamente no callback (comportamento esperado)

### Migração não funcionou

**Sintoma**: Usuários antigos não conseguem fazer login

**Verificação**:
```sql
SELECT id, email, raw_user_meta_data->>'app_type' as app_type
FROM auth.users
WHERE raw_user_meta_data->>'app_type' IS NULL;
```

**Solução**: Re-executar script de migração

## Estrutura de Arquivos

```
src/
├── utils/
│   ├── auth/
│   │   └── appType.ts              # Funções auxiliares
│   └── supabase/
│       └── middleware.ts            # Proteção de rotas
├── app/
│   ├── login/
│   │   ├── actions.ts              # Login e signup com verificação
│   │   └── LoginPageClient.tsx     # Tratamento de erros
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts            # Callback OAuth com verificação
│   └── applicant/
│       └── **/page.tsx             # Páginas protegidas

docs/
└── SQL/
    └── migrate_existing_users_app_type.sql  # Script de migração
```

## Notas Importantes

1. **Não remova verificações**: Todas as verificações são necessárias para segurança
2. **Middleware é crítico**: Primeira linha de defesa
3. **Server Components**: Segunda linha de defesa
4. **Mensagens de erro**: Claras e informativas para o usuário
5. **Migração**: Execute apenas uma vez, após deploy da feature
