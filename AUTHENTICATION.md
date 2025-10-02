# Sistema de Autenticação - NEXO

Este projeto implementa um sistema completo de autenticação usando Supabase com Next.js 15.

## Funcionalidades Implementadas

### ✅ Autenticação por Email e Senha
- Login com email e senha
- Cadastro de novos usuários
- Validação de formulários
- Confirmação de email

### ✅ Recuperação de Senha
- Solicitação de redefinição de senha por email
- Página de redefinição de senha
- Validação de tokens de recuperação

### ✅ OAuth com Google
- Login com conta do Google
- Integração com Supabase Auth
- Redirecionamento automático

### ✅ Proteção de Rotas
- Middleware para proteger rotas autenticadas
- Redirecionamento automático para login
- Gerenciamento de sessões

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env.local` e configure as variáveis:

```bash
cp env.example .env.local
```

Preencha as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Configuração do Supabase

#### 2.1 Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e as chaves do projeto

#### 2.2 Configurar OAuth do Google
1. No painel do Supabase, vá para **Authentication > Providers**
2. Ative o provider **Google**
3. Configure as credenciais OAuth do Google:

**No Google Cloud Console:**
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services > Credentials**
4. Clique em **Create Credentials > OAuth 2.0 Client IDs**
5. Configure:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`

**No Supabase:**
1. Cole o Client ID e Client Secret do Google
2. Configure a URL de redirecionamento: `https://your-project.supabase.co/auth/v1/callback`

#### 2.3 Configurar URLs de Redirecionamento
No painel do Supabase, vá para **Authentication > URL Configuration** e configure:

**Site URL:**
- Desenvolvimento: `http://localhost:3000`
- Produção: `https://seu-dominio.com`

**Redirect URLs (adicione todas as URLs abaixo):**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/reset-password`
- `https://seu-dominio.com/auth/callback` (para produção)
- `https://seu-dominio.com/auth/reset-password` (para produção)

**Importante:** Certifique-se de que todas as URLs de redirecionamento estejam listadas no Supabase, caso contrário o fluxo de recuperação de senha não funcionará.

### 3. Configuração de Email (Opcional)
Para envio de emails de confirmação e recuperação:

1. No Supabase, vá para **Authentication > Settings**
2. Configure o SMTP ou use o serviço padrão do Supabase
3. Personalize os templates de email se necessário

## Estrutura do Projeto

```
src/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts          # Callback OAuth
│   │   ├── auth-code-error/page.tsx   # Erro de autenticação
│   │   └── reset-password/page.tsx    # Redefinição de senha
│   ├── login/
│   │   ├── page.tsx                   # Página de login
│   │   ├── actions.ts                 # Server actions
│   │   └── error.tsx                  # Página de erro
│   └── page.tsx                       # Página principal
├── components/
│   └── LogoutButton.tsx               # Botão de logout
├── utils/
│   └── supabase/
│       ├── client.ts                  # Cliente Supabase
│       ├── server.ts                  # Cliente servidor
│       └── middleware.ts              # Middleware de autenticação
└── middleware.ts                      # Middleware principal
```

## Como Usar

### Login
1. Acesse `/login`
2. Digite email e senha
3. Clique em "Entrar"

### Cadastro
1. Na página de login, clique em "Não tem conta? Criar conta"
2. Preencha os dados
3. Verifique seu email para confirmar a conta

### Recuperação de Senha
1. Na página de login, clique em "Esqueceu sua senha?"
2. Digite seu email
3. Verifique sua caixa de entrada
4. Clique no link recebido para redefinir a senha

### Login com Google
1. Na página de login, clique em "Continuar com Google"
2. Autorize o aplicativo
3. Você será redirecionado automaticamente

## Rotas Protegidas

O middleware protege automaticamente todas as rotas exceto:
- `/login`
- `/auth/*`
- `/error`
- Arquivos estáticos

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Segurança

- Senhas são hasheadas automaticamente pelo Supabase
- Tokens de sessão são gerenciados automaticamente
- URLs de redirecionamento são validadas
- Middleware protege rotas sensíveis
- Validação de entrada nos formulários

## Troubleshooting

### Link de recuperação de senha não funciona
1. **Verifique as URLs de redirecionamento no Supabase:**
   - Vá para **Authentication > URL Configuration**
   - Adicione `http://localhost:3000/auth/reset-password` nas Redirect URLs
   - Para produção, adicione `https://seu-dominio.com/auth/reset-password`

2. **Verifique a variável de ambiente:**
   - Confirme se `NEXT_PUBLIC_SITE_URL` está configurada corretamente
   - Para desenvolvimento: `http://localhost:3000`
   - Para produção: `https://seu-dominio.com`

3. **Teste o fluxo completo:**
   - Solicite recuperação de senha
   - Verifique se o email foi enviado
   - Clique no link do email
   - Confirme se redireciona para `/auth/reset-password`

### Erro de CORS
- Verifique se as URLs de redirecionamento estão configuradas corretamente no Supabase

### OAuth não funciona
- Verifique se as credenciais do Google estão corretas
- Confirme se a URL de redirecionamento está autorizada no Google Cloud Console

### Emails não são enviados
- Verifique a configuração SMTP no Supabase
- Confirme se o domínio não está em lista negra

### Sessão expira rapidamente
- Verifique as configurações de sessão no Supabase
- Ajuste o tempo de expiração se necessário

### "Link inválido ou expirado" na página de redefinição
- O link pode ter expirado (válido por 1 hora)
- Solicite um novo link de recuperação
- Verifique se as URLs de redirecionamento estão corretas no Supabase
