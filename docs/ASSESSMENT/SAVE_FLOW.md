# Fluxo de Salvamento de Resultados

## Visão Geral

Os resultados das avaliações são salvos **APENAS no banco de dados**, diretamente nas tabelas específicas:
- `five_mind_results` para avaliações FiveMind
- `hexa_mind_results` para avaliações HexaMind

**NÃO há salvamento no localStorage**. Se o salvamento falhar, um erro será lançado.

## Fluxo Completo

### 1. Usuário Completa a Avaliação

```
FiveMindQuestionnaire / HexaMindQuestionnaire
  ↓
Usuário responde todas as questões
  ↓
calculateResults() é executado
  ↓
onComplete(resultData) é chamado
```

### 2. AssessmentContent.handleComplete()

```typescript
handleComplete(resultData: AssessmentResult)
  ↓
Verifica se user?.id existe
  ↓
Se NÃO: Lança erro e alerta usuário
  ↓
Se SIM: Chama saveResults(user.id, resultData)
```

### 3. resultsStorage.saveResults()

```typescript
saveResults(userId: string, result: AssessmentResult)
  ↓
Verifica se userId existe
  ↓
Se NÃO: Lança erro (não salva em localStorage)
  ↓
Se SIM: Chama saveAssessmentResult(userId, result)
```

### 4. assessmentService.saveAssessmentResult()

```typescript
saveAssessmentResult(userId: string, result: AssessmentResult)
  ↓
1. Identifica tipo de avaliação (five-mind ou hexa-mind)
  ↓
2. Salva na tabela específica:
   - FiveMind → saveFiveMindResult() → five_mind_results
   - HexaMind → saveHexaMindResult() → hexa_mind_results
  ↓
3. Trigger SQL executa automaticamente:
   - update_user_analise_perfil_from_fivemind_results()
   - update_user_analise_perfil_from_hexamind_results()
  ↓
4. Trigger atualiza users.profile_analysis com características convertidas
```

## Conversão de Resultados

### Como Funciona

Os triggers SQL (`update_user_analise_perfil_from_fivemind_results` e `update_user_analise_perfil_from_hexamind_results`) convertem automaticamente os valores numéricos (1.0-5.0) em características textuais descritivas.

### Exemplo: FiveMind

Se um usuário tem:
- `openness: 4.5`
- `conscientiousness: 3.8`
- `extraversion: 4.2`
- `agreeableness: 3.5`
- `neuroticism: 2.1`

O trigger converte para:
```json
[
  "Abertura à Experiências: Muito alta criatividade, curiosidade intensa e grande abertura a novas ideias",
  "Conscienciosidade: Organização, disciplina e responsabilidade",
  "Extroversão: Sociabilidade, assertividade e energia",
  "Amabilidade: Nível moderado de empatia e disposição para colaborar",
  "Estabilidade Emocional: Resiliência, calma e controle emocional"
]
```

E atualiza `users.profile_analysis` com este array.

### Mapeamento de Scores

Cada fator é convertido baseado em faixas:
- **>= 4.5**: Característica muito alta
- **>= 4.0**: Característica alta
- **>= 3.0**: Característica moderada
- **>= 2.0**: Característica baixa
- **< 2.0**: Característica muito baixa

**Nota**: Para `neuroticism` (FiveMind) e `emotional_stability` (HexaMind), valores BAIXOS indicam ESTABILIDADE (positivo).

## Tabelas Envolvidas

### 1. five_mind_results
- Armazena resultados detalhados do FiveMind
- Colunas: `openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism`, `overall_score`
- Trigger: `trigger_update_analise_perfil_from_fivemind_results`

### 2. hexa_mind_results
- Armazena resultados detalhados do HexaMind
- Colunas: `honesty`, `emotional_stability`, `extraversion`, `agreeableness`, `conscientiousness`, `openness`, `consistency`, `response_consistency`, `overall_score`
- Trigger: `trigger_update_analise_perfil_from_hexamind_results`

### 3. assessment_results (Opcional)
- Tabela geral para histórico/compatibilidade
- Salvamento é opcional e não crítico se falhar
- Não tem trigger para atualizar `profile_analysis`

### 4. users
- Campo `profile_analysis` é atualizado automaticamente pelos triggers
- Contém array de características textuais convertidas dos resultados

## Tratamento de Erros

### Erro: Usuário não autenticado
```typescript
if (!user?.id) {
    alert("Erro: Você precisa estar autenticado para salvar os resultados.");
    return;
}
```

### Erro: Falha ao salvar
```typescript
try {
    await saveResults(user.id, resultData);
} catch (error) {
    console.error("Erro ao salvar resultados:", error);
    alert("Erro ao salvar resultados. Verifique o console para mais detalhes.");
}
```

**Importante**: Não há fallback para localStorage. Se o salvamento falhar, o erro é propagado e o usuário é notificado.

## Verificação

### 1. Verificar se foi salvo
```sql
-- FiveMind
SELECT * FROM five_mind_results 
WHERE user_id = 'SEU_USER_ID' 
ORDER BY completed_at DESC 
LIMIT 1;

-- HexaMind
SELECT * FROM hexa_mind_results 
WHERE user_id = 'SEU_USER_ID' 
ORDER BY completed_at DESC 
LIMIT 1;
```

### 2. Verificar se profile_analysis foi atualizado
```sql
SELECT id, full_name, profile_analysis 
FROM users 
WHERE id = 'SEU_USER_ID';
```

### 3. Verificar triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('five_mind_results', 'hexa_mind_results');
```

## Logs Esperados

Ao completar uma avaliação com sucesso, você deve ver:

```
🔄 [AssessmentContent] handleComplete chamado
📊 Resultado recebido: {...}
👤 User ID: <uuid>
💾 [AssessmentContent] Iniciando salvamento...
📦 saveResults chamado: {userId: '<uuid>', assessmentId: 'five-mind'}
🔐 Usuário autenticado, salvando APENAS no banco de dados...
📊 saveAssessmentResult - Iniciando salvamento: {...}
🧠 Detectado FiveMind, salvando em five_mind_results...
📝 Inserindo em five_mind_results: {...}
✅ Resultado do FiveMind salvo em five_mind_results: {...}
🔄 Trigger SQL deve atualizar users.profile_analysis automaticamente com características convertidas
✅ [AssessmentContent] Salvamento concluído com sucesso
```

## Diferenças da Versão Anterior

### Antes
- ❌ Salvava no localStorage como fallback
- ❌ Salvava primeiro em `assessment_results`
- ❌ Conversão manual no código TypeScript

### Agora
- ✅ Salva APENAS no banco de dados
- ✅ Salva diretamente nas tabelas específicas
- ✅ Conversão automática via triggers SQL
- ✅ `profile_analysis` atualizado automaticamente

