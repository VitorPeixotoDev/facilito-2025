# Sistema de Vagas - Guia Rápido

## Instalação Rápida

### 1. Criar tabela de candidaturas

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: docs/SQL/create_job_applications_table.sql
```

Este script cria:
- Tabela `job_applications`
- Triggers para atualizar contadores
- Políticas RLS
- Funções RPC auxiliares

### 2. Configurar RLS para tabela jobs

```sql
-- Execute no Supabase SQL Editor
-- Arquivo: docs/SQL/fix_rls_for_jobs.sql
```

Este script configura:
- Políticas para usuários verem vagas disponíveis
- Políticas para recruiters gerenciarem suas vagas

## Verificação Rápida

### Testar se as vagas aparecem

```sql
-- Verificar vagas disponíveis
SELECT id, title, status, owner_id 
FROM jobs 
WHERE status = 'recebendo_candidatos';

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'jobs';
```

### Testar candidaturas

```sql
-- Ver candidaturas de um usuário
SELECT * FROM job_applications WHERE user_id = 'USER_ID';

-- Ver candidaturas de uma vaga
SELECT * FROM job_applications WHERE job_id = 'JOB_ID';
```

## Estrutura de Arquivos

```
docs/
├── SQL/
│   ├── create_job_applications_table.sql  ← Execute primeiro
│   └── fix_rls_for_jobs.sql               ← Execute depois
└── VACANCIES/
    ├── README.md                          ← Este arquivo
    └── VACANCIES_SYSTEM.md                ← Documentação completa
```

## Troubleshooting

### Vagas não aparecem?

1. ✅ Execute `fix_rls_for_jobs.sql`
2. ✅ Verifique se as vagas têm `status = 'recebendo_candidatos'`
3. ✅ Verifique se o usuário está autenticado

### Candidaturas não funcionam?

1. ✅ Execute `create_job_applications_table.sql`
2. ✅ Verifique se o usuário já não se candidatou (UNIQUE constraint)
3. ✅ Verifique logs do servidor para erros

Para mais detalhes, consulte `VACANCIES_SYSTEM.md`.
