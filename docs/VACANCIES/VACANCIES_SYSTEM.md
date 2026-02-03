# Sistema de Vagas e Candidaturas

## Visão Geral

Este documento descreve o sistema completo de vagas e candidaturas implementado na aplicação. O sistema permite que recruiters criem e gerenciem vagas, enquanto usuários (candidates) podem visualizar vagas disponíveis e se candidatar.

## Arquitetura

### Fluxo de Dados

```
┌─────────────────┐
│   Recruiter     │
│   (Cria Vaga)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Tabela jobs   │
│  status:        │
│  recebendo_     │
│  candidatos     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│   User          │────▶│ job_applications │
│  (Visualiza e   │     │  (Candidatura)   │
│   Candidata)    │◀────│                  │
└─────────────────┘     └──────────────────┘
```

### Componentes Principais

1. **Server Components** (`src/app/applicant/vacancies/page.tsx`)
   - Busca dados iniciais no servidor
   - Autenticação e redirecionamento

2. **Client Components** (`src/components/applicant/vacancies/`)
   - `VagasPageClient.tsx`: Gerencia estado e lógica de candidaturas
   - `VagasHeader.tsx`: Header com busca e tabs
   - `VagaCard.tsx`: Card individual de vaga
   - `VagaDetailsModal.tsx`: Modal com detalhes completos
   - `VagasEmptyState.tsx`: Estado vazio

3. **Services**
   - `serverVacancyService.ts`: Busca de vagas e candidaturas (server-side)
   - `clientVacancyService.ts`: Gerenciamento de localStorage (fallback)

4. **Actions** (`src/app/applicant/vacancies/actions.ts`)
   - `applyToJob()`: Cria candidatura
   - `removeApplication()`: Remove candidatura

## Estrutura do Banco de Dados

### Tabela: `jobs`

Armazena todas as vagas criadas por recruiters.

#### Colunas Principais

- `id` (uuid, PK): Identificador único da vaga
- `owner_id` (uuid, FK): ID do recruiter dono da vaga (referência a `auth.users`)
- `title` (text): Título da vaga
- `status` (job_status enum): Status da vaga
  - `'recebendo_candidatos'`: Vaga ativa e recebendo candidaturas
  - `'pausada'`: Vaga pausada temporariamente
  - `'finalizada'`: Vaga finalizada
  - `'rascunho'`: Vaga em rascunho (não visível)
- `work_model` (work_model enum): Modelo de trabalho
  - `'presencial'`: Trabalho presencial
  - `'remoto'`: Trabalho remoto
  - `'hibrido'`: Trabalho híbrido
- `description` (text): Descrição completa da vaga
- `required_skills` (text): Habilidades obrigatórias (separadas por vírgula/linha)
- `preferred_skills` (text): Habilidades preferidas (separadas por vírgula/linha)
- `salary_range` (text): Faixa salarial
- `work_address` (text): Endereço de trabalho
- `latitude` / `longitude` (numeric): Coordenadas geográficas
- `benefits` (text): Benefícios oferecidos
- `company_culture` (text): Cultura da empresa
- `applications_count` (integer): Contador de candidaturas
- `candidates_in_review` (integer): Candidatos em revisão
- `new_applications_last_24h` (integer): Novas candidaturas nas últimas 24h

### Tabela: `job_applications`

Armazena as candidaturas de usuários para vagas.

#### Colunas

- `id` (uuid, PK): Identificador único da candidatura
- `job_id` (uuid, FK): ID da vaga
- `user_id` (uuid, FK): ID do usuário candidato
- `applied_at` (timestamp): Data e hora da candidatura
- `status` (text): Status da candidatura (pendente, em_revisao, aprovado, reprovado)
- `notes` (text): Notas adicionais
- `created_at` / `updated_at` (timestamp): Timestamps de controle

#### Constraints

- **UNIQUE (job_id, user_id)**: Um usuário só pode se candidatar uma vez por vaga

## Políticas RLS (Row Level Security)

### Tabela `jobs`

#### SELECT (Leitura)
- ✅ **Usuários autenticados**: Podem ver vagas com `status = 'recebendo_candidatos'`
- ✅ **Recruiters**: Podem ver todas as suas vagas (qualquer status)

#### INSERT (Criação)
- ✅ **Recruiters**: Podem criar vagas (verificado via tabela `recruiter`)
- ❌ **Usuários comuns**: Não podem criar vagas

#### UPDATE (Atualização)
- ✅ **Dono da vaga** (`owner_id = auth.uid()`): Pode atualizar sua vaga
- ❌ **Outros usuários**: Não podem atualizar vagas

#### DELETE (Exclusão)
- ✅ **Dono da vaga** (`owner_id = auth.uid()`): Pode deletar sua vaga
- ❌ **Outros usuários**: Não podem deletar vagas

### Tabela `job_applications`

#### SELECT (Leitura)
- ✅ **Usuários**: Podem ver apenas suas próprias candidaturas
- ✅ **Recruiters**: Podem ver candidaturas das suas vagas

#### INSERT (Criação)
- ✅ **Usuários autenticados**: Podem criar candidaturas para si mesmos
- ❌ **Recruiters**: Não podem criar candidaturas (apenas visualizar)

#### UPDATE (Atualização)
- ✅ **Usuários**: Podem atualizar suas próprias candidaturas
- ✅ **Recruiters**: Podem atualizar candidaturas das suas vagas (para mudar status, por exemplo)

#### DELETE (Exclusão)
- ✅ **Usuários**: Podem remover suas próprias candidaturas
- ❌ **Recruiters**: Não podem remover candidaturas (apenas atualizar status)

## Funcionalidades Implementadas

### 1. Listagem de Vagas

**Localização**: `src/lib/vacancies/serverVacancyService.ts`

**Função**: `fetchAvailableJobs()`

**Comportamento**:
- Busca apenas vagas com `status = 'recebendo_candidatos'`
- Ordena por `created_at` (mais recentes primeiro)
- Transforma dados do banco para formato de exibição (`JobDisplay`)

**Mapeamento de Campos**:
- `title` → `titulo`
- `work_address` → `localizacao`
- `work_model` → `tipo` (formatado: Presencial/Remoto/Híbrido)
- `salary_range` → `salario`
- `required_skills` → `requisitos` (parseado para array)
- `preferred_skills` → `habilidadesPreferidas` (parseado para array)

### 2. Busca e Filtragem

**Localização**: `src/components/applicant/vacancies/VagasPageClient.tsx`

**Funcionalidades**:
- Busca por título, localização, tipo de trabalho, habilidades
- Filtro por tab: "Vagas" ou "Candidaturas"
- Filtragem em tempo real (client-side)

**Algoritmo de Busca**:
```typescript
filtradas = vagas.filter(vaga =>
    vaga.titulo.toLowerCase().includes(termo) ||
    vaga.localizacao.toLowerCase().includes(termo) ||
    vaga.tipo.toLowerCase().includes(termo) ||
    vaga.requisitos.some(r => r.toLowerCase().includes(termo)) ||
    vaga.habilidadesPreferidas.some(r => r.toLowerCase().includes(termo))
);
```

### 2.1. Busca por código de 6 dígitos (mobile-first)

**Objetivo**: Permitir buscar vagas pelo código de localização do recrutador (6 dígitos), em uma **busca à parte** da busca por texto.

**Localização**:
- `src/components/applicant/vacancies/VagasHeader.tsx` — UI do campo de busca (modo texto vs. modo código)
- `src/components/applicant/vacancies/VagasPageClient.tsx` — estado e chamada à server action
- `src/lib/vacancies/serverVacancyService.ts` — `fetchJobsByLocationCode(code)`
- `src/app/applicant/vacancies/actions.ts` — `getJobsByLocationCode(code)`

**Fluxo**:

1. **Modo texto (padrão)**  
   Campo de busca único + botão com ícone de **teclado** (remete ao teclado do celular). Ao clicar no ícone, o campo de busca é substituído pelos 6 campos de dígitos.

2. **Modo código**  
   - Seis campos individuais para preenchimento dos números (`inputMode="numeric"`, `pattern="[0-9]*"` para abrir teclado numérico no mobile).  
   - Foco avança automaticamente ao digitar; Backspace em campo vazio volta ao campo anterior.  
   - Botão de **reversão** (ícone seta/voltar): volta ao campo de busca por texto e limpa o código.

3. **Busca**  
   Quando os 6 dígitos estão preenchidos, a aplicação chama a server action `getJobsByLocationCode(code)`, que:
   - Consulta a tabela `recruiter_location_codes` pela coluna **`code_6_digits`** (6 dígitos);
   - Filtra `jobs` por `recruiter_location_code_id` correspondente e `status = 'recebendo_candidatos'`;
   - Retorna a lista de vagas no formato `JobDisplay[]`.

4. **Resultado**  
   - Lista exibida é apenas a da busca por código (filtros por tab e tipo de trabalho continuam aplicados).  
   - Estado vazio específico: "Nenhuma vaga para este código" quando a busca por código não retorna resultados.

**Banco de dados** (ver seção Configuração):
- Tabela `recruiter_location_codes` já existente; coluna do código: **`code_6_digits`**.
- Coluna `jobs.recruiter_location_code_id` (FK para `recruiter_location_codes`).

**Documentação SQL**: `docs/SQL/add_recruiter_location_codes.sql`

### 3. Candidaturas

**Fluxo de Candidatura**:

1. Usuário clica em "Candidatar-me"
2. **Otimistic Update**: UI atualiza imediatamente
3. **Server Action**: `applyToJob()` é chamado
4. **Inserção no Banco**: Registro criado em `job_applications`
5. **Trigger**: Contador `applications_count` é incrementado automaticamente
6. **Fallback**: Se falhar, usa `localStorage` como backup

**Remoção de Candidatura**:

1. Usuário clica em "Desistir"
2. **Otimistic Update**: UI atualiza imediatamente
3. **Server Action**: `removeApplication()` é chamado
4. **Remoção do Banco**: Registro deletado de `job_applications`
5. **Trigger**: Contador `applications_count` é decrementado automaticamente

### 4. Persistência e Sincronização

**Estratégia Híbrida**:

1. **Prioridade**: Banco de dados (`job_applications`)
2. **Fallback**: `localStorage` (quando tabela não existe ou erro)

**Sincronização**:
- Ao carregar a página, busca do banco + sincroniza com `localStorage`
- Event listeners para mudanças no `localStorage` (cross-tab)

### 5. Detalhes da Vaga

**Modal de Detalhes** (`VagaDetailsModal.tsx`):

Exibe:
- Informações básicas (título, localização, modelo, salário)
- Descrição completa
- Habilidades obrigatórias (badges)
- Habilidades preferidas (badges)
- Benefícios
- Cultura da empresa
- Etapas de seleção (se disponível)
- Competências comportamentais (se disponível)

## Configuração e Instalação

### 1. Criar Tabela `job_applications`

Execute o script SQL:
```bash
# Via Supabase Dashboard ou CLI
psql -f docs/SQL/create_job_applications_table.sql
```

Ou via Supabase Dashboard:
1. Acesse SQL Editor
2. Cole o conteúdo de `docs/SQL/create_job_applications_table.sql`
3. Execute

### 2. Configurar RLS para `jobs`

Execute o script SQL:
```bash
psql -f docs/SQL/fix_rls_for_jobs.sql
```

### 3. Busca por código de 6 dígitos (opcional)

A tabela `recruiter_location_codes` já existe; a coluna do código é `code_6_digits`. Para habilitar a busca por código, adicione a FK em `jobs`:

```bash
psql -f docs/SQL/add_recruiter_location_codes.sql
```

Isso adiciona a coluna `jobs.recruiter_location_code_id` e configura RLS em `recruiter_location_codes`. Sem essa migração, a busca por código retorna lista vazia (e a UI continua funcional).

**Importante**: Certifique-se de que:
- A tabela `recruiter` existe
- O enum `job_status` existe
- O enum `work_model` existe

### 4. Verificar Políticas RLS

```sql
-- Ver políticas da tabela jobs
SELECT * FROM pg_policies WHERE tablename = 'jobs';

-- Ver políticas da tabela job_applications
SELECT * FROM pg_policies WHERE tablename = 'job_applications';
```

## Troubleshooting

### Problema: Vagas não aparecem na listagem

**Possíveis Causas**:

1. **RLS bloqueando acesso**
   ```sql
   -- Verificar se RLS está habilitado
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'jobs';
   
   -- Verificar políticas
   SELECT * FROM pg_policies WHERE tablename = 'jobs';
   ```

2. **Status da vaga não é 'recebendo_candidatos'**
   ```sql
   -- Verificar status das vagas
   SELECT id, title, status 
   FROM jobs 
   ORDER BY created_at DESC;
   ```

3. **Usuário não autenticado**
   - Verificar se `auth.uid()` retorna um valor
   - Verificar middleware de autenticação

**Solução**:
- Execute `docs/SQL/fix_rls_for_jobs.sql`
- Verifique se o usuário está autenticado
- Verifique o status das vagas no banco

### Problema: Candidaturas não são salvas

**Possíveis Causas**:

1. **Tabela `job_applications` não existe**
   - Execute `docs/SQL/create_job_applications_table.sql`

2. **RLS bloqueando INSERT**
   ```sql
   -- Verificar políticas de INSERT
   SELECT * FROM pg_policies 
   WHERE tablename = 'job_applications' AND cmd = 'INSERT';
   ```

3. **Constraint UNIQUE violado**
   - Usuário já se candidatou para a vaga
   - Verificar logs do servidor

**Solução**:
- Execute `docs/SQL/create_job_applications_table.sql`
- Verifique se o usuário já se candidatou: 
  ```sql
  SELECT * FROM job_applications 
  WHERE job_id = 'JOB_ID' AND user_id = 'USER_ID';
  ```

### Problema: Contador de candidaturas não atualiza

**Possíveis Causas**:

1. **Triggers não criados**
   ```sql
   -- Verificar triggers
   SELECT trigger_name, event_manipulation, event_object_table
   FROM information_schema.triggers
   WHERE event_object_table = 'job_applications';
   ```

2. **Funções RPC não existem**
   - As funções `increment_job_applications()` e `decrement_job_applications()` são opcionais
   - Os triggers fazem isso automaticamente

**Solução**:
- Re-execute `docs/SQL/create_job_applications_table.sql`
- Os triggers devem atualizar automaticamente

## Estrutura de Arquivos

```
src/
├── app/
│   └── applicant/
│       └── vacancies/
│           ├── page.tsx          # Server Component (busca inicial)
│           └── actions.ts        # Server Actions (apply/remove)
├── components/
│   └── applicant/
│       └── vacancies/
│           ├── VagasPageClient.tsx    # Client Component principal
│           ├── VagasHeader.tsx        # Header com busca e tabs
│           ├── VagaCard.tsx           # Card de vaga
│           ├── VagaDetailsModal.tsx   # Modal de detalhes
│           ├── VagasEmptyState.tsx    # Estado vazio
│           └── index.ts               # Exports
└── lib/
    └── vacancies/
        ├── types.ts                   # Tipos TypeScript
        ├── serverVacancyService.ts    # Serviço server-side
        └── clientVacancyService.ts    # Serviço client-side (localStorage)

docs/
├── SQL/
│   ├── create_job_applications_table.sql  # Criação da tabela
│   ├── fix_rls_for_jobs.sql              # Políticas RLS para jobs
│   └── add_recruiter_location_codes.sql   # Busca por código 6 dígitos
└── VACANCIES/
    └── VACANCIES_SYSTEM.md               # Esta documentação
```

## Próximos Passos (Futuro)

- [ ] Adicionar filtros avançados (salário, localização, tipo)
- [ ] Implementar cálculo de distância baseado em coordenadas
- [ ] Adicionar notificações para novos candidatos (recruiters)
- [ ] Implementar sistema de favoritos
- [ ] Adicionar recomendações de vagas baseadas no perfil
- [ ] Dashboard para recruiters visualizarem candidaturas
- [ ] Sistema de status de candidatura mais robusto
- [ ] Integração com email/notificações
