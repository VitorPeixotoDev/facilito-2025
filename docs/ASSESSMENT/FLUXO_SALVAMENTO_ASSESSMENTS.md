# Fluxo de Salvamento de Avaliações

## Visão Geral

Este documento explica **exatamente quando e como** os dados das avaliações são salvos no banco de dados.

## Fluxo Completo

### 1. Usuário Completa o Questionário

```
FiveMindQuestionnaire.tsx
  ↓
Usuário responde todas as questões
  ↓
Clica em "Finalizar"
  ↓
calculateResults() é executado
  ↓
onComplete(resultData) é chamado
```

### 2. Chamada do Handler

```
AssessmentContent.tsx
  ↓
handleComplete(resultData) recebe os resultados
  ↓
console.log('🔄 handleComplete chamado')
  ↓
setResults(resultData) - atualiza estado local
  ↓
setCurrentView('results') - muda para tela de resultados
  ↓
await saveResults(user?.id || null, resultData) - SALVA NO BANCO
```

### 3. Salvamento no Banco de Dados

```
resultsStorage.ts - saveResults()
  ↓
Verifica se user?.id existe
  ↓
Se SIM: chama saveAssessmentResult()
  ↓
Se NÃO: salva apenas no localStorage
```

### 4. Salvamento em Múltiplas Tabelas

```
assessmentService.ts - saveAssessmentResult()
  ↓
1. Salva em assessment_results (tabela geral)
     ↓
     INSERT INTO assessment_results (...)
     ↓
     ✅ Sucesso
  ↓
2. Verifica se é FiveMind
     ↓
     Se SIM: chama saveFiveMindResult()
     ↓
     INSERT INTO five_mind_results (...)
     ↓
     ✅ Sucesso
     ↓
     🔄 TRIGGER executa automaticamente
     ↓
     UPDATE users SET analise_perfil = ... WHERE id = user_id
     ↓
     ✅ users.analise_perfil atualizado
```

## Verificação - Como Saber se Está Funcionando

### 1. Console do Navegador

Ao completar uma avaliação, você deve ver estes logs:

```
🔄 handleComplete chamado com: {assessmentId: 'five-mind', ...}
👤 User ID: <uuid-do-usuario>
💾 Iniciando salvamento no banco de dados...
📦 saveResults chamado: {userId: '<uuid>', assessmentId: 'five-mind'}
🔐 Usuário autenticado, salvando no banco de dados...
📊 saveAssessmentResult - Iniciando salvamento: {...}
📝 Inserindo em assessment_results...
✅ Resultado salvo em assessment_results: {...}
🧠 Detectado FiveMind, salvando em five_mind_results...
📝 Inserindo em five_mind_results: {...}
✅ Resultado do FiveMind salvo: {...}
🔄 O trigger deve atualizar users.analise_perfil automaticamente
✅ Salvamento concluído com sucesso
```

### 2. Verificar no Banco de Dados

Execute estas queries no Supabase:

```sql
-- Verificar se foi salvo em assessment_results
SELECT * FROM assessment_results
WHERE user_id = 'SEU_USER_ID'
ORDER BY completed_at DESC
LIMIT 1;

-- Verificar se foi salvo em five_mind_results
SELECT * FROM five_mind_results
WHERE user_id = 'SEU_USER_ID'
ORDER BY completed_at DESC
LIMIT 1;

-- Verificar se analise_perfil foi atualizado
SELECT id, full_name, analise_perfil
FROM users
WHERE id = 'SEU_USER_ID';
```

### 3. Verificar Logs do Supabase

No Dashboard do Supabase:
1. Vá em **Logs** → **Database Logs**
2. Procure por mensagens de `NOTICE` ou `WARNING`
3. Deve aparecer: `Atualizado analise_perfil para user_id: ...`

## Problemas Comuns

### ❌ Não aparece nenhum log no console

**Causa**: `handleComplete` não está sendo chamado

**Solução**: 
- Verificar se o botão "Finalizar" está chamando `calculateResults()`
- Verificar se `onComplete` está sendo passado corretamente

### ❌ Logs aparecem mas dados não são salvos

**Causa**: Erro na inserção no banco

**Solução**:
- Verificar políticas RLS no Supabase
- Verificar se a tabela existe
- Verificar erros no console (aparecerão com ❌)

### ❌ Dados salvos mas `analise_perfil` não atualiza

**Causa**: Trigger não está funcionando

**Solução**:
1. Verificar se o trigger existe:
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_analise_perfil_from_fivemind_results';
```

2. Verificar se a função tem SECURITY DEFINER:
```sql
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_name = 'update_user_analise_perfil_from_fivemind_results';
```

3. Executar o script de correção: `docs/sql/five_mind_results_table.sql`

## Código Responsável

### Arquivos Principais

1. **`src/app/candidato/marketing/avaliacoes/[id]/AssessmentContent.tsx`**
   - `handleComplete()` - Recebe resultados e inicia salvamento

2. **`src/lib/assessments/resultsStorage.ts`**
   - `saveResults()` - Camada de abstração (banco + localStorage)

3. **`src/lib/assessments/assessmentService.ts`**
   - `saveAssessmentResult()` - Salva em `assessment_results`
   - `saveFiveMindResult()` - Salva em `five_mind_results`

4. **`docs/sql/five_mind_results_table.sql`**
   - Trigger que atualiza `users.analise_perfil`

## Teste Manual

Para testar se está funcionando:

1. Abra o console do navegador (F12)
2. Complete uma avaliação FiveMind
3. Observe os logs no console
4. Verifique no Supabase se os dados foram salvos
5. Verifique se `users.analise_perfil` foi atualizado

Se algum passo falhar, os logs indicarão exatamente onde está o problema.

