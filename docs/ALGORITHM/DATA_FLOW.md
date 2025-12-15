# Fluxo de Dados

## Visão Geral

Este documento detalha como os dados fluem através do sistema de ranking, desde a requisição inicial até a exibição dos resultados na UI.

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO ACESSA PÁGINA                                         │
│    src/app/applicant/page.tsx                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. useEffect DISPARA                                             │
│    - user?.id disponível                                         │
│    - profile carregado                                           │
│    - Chama: fetchAndRankCandidates(user.id)                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CAMADA DE SERVIÇO                                            │
│    src/lib/ranking/service.ts                                    │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ fetchUserProfile(userId)                             │    │
│    │                                                       │    │
│    │ Query Supabase:                                      │    │
│    │   SELECT * FROM users WHERE id = userId              │    │
│    │                                                       │    │
│    │ Transformação:                                       │    │
│    │   - JSONB home_address → UserLocation                │    │
│    │   - Arrays vazios → []                               │    │
│    │                                                       │    │
│    │ Retorno: CandidateProfile | null                     │    │
│    └───────────────────┬──────────────────────────────────┘    │
│                        │                                        │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ fetchCandidatesFromDatabase(userId, limit=200)       │    │
│    │                                                       │    │
│    │ Query Supabase:                                      │    │
│    │   SELECT * FROM users                                │    │
│    │   WHERE id != userId                                 │    │
│    │   LIMIT 200                                          │    │
│    │                                                       │    │
│    │ Transformação (map):                                 │    │
│    │   - Cada row → CandidateProfile                      │    │
│    │   - home_address parsing                             │    │
│    │                                                       │    │
│    │ Retorno: CandidateProfile[]                          │    │
│    └───────────────────┬──────────────────────────────────┘    │
│                        │                                        │
│                        ▼                                        │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ runRankingInWorker(user, candidates, maxDistance)    │    │
│    │                                                       │    │
│    │ 1. Cria Web Worker (Blob URL)                        │    │
│    │ 2. Envia dados via postMessage()                     │    │
│    │ 3. Aguarda resposta                                  │    │
│    │ 4. Retorna Promise<RankingResult>                    │    │
│    └───────────────────┬──────────────────────────────────┘    │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. WEB WORKER (Thread Paralelo)                                  │
│    Código inline em service.ts                                   │
│                                                                  │
│    Recebe: { user, candidates, maxDistance }                    │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ PASSO 1: FILTRAGEM                                   │    │
│    │                                                       │    │
│    │ Input: candidates[]                                  │    │
│    │                                                       │    │
│    │ 1.1. Remover usuário:                                │    │
│    │      otherCandidates = candidates.filter(            │    │
│    │          c => c.id !== user.id                       │    │
│    │      )                                                │    │
│    │                                                       │    │
│    │ 1.2. Filtrar habilidades comuns:                     │    │
│    │      withCommonSkills = otherCandidates.filter(      │    │
│    │          c => hasCommonSkills(user, c)               │    │
│    │      )                                                │    │
│    │                                                       │    │
│    │ 1.3. Filtrar proximidade:                            │    │
│    │      relevantCandidates = withCommonSkills.filter(   │    │
│    │          c => checkProximity(...)                    │    │
│    │      )                                                │    │
│    │                                                       │    │
│    │ Output: relevantCandidates[]                         │    │
│    └───────────────────┬──────────────────────────────────┘    │
│                        │                                        │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ PASSO 2: CÁLCULO DE SCORES                           │    │
│    │                                                       │    │
│    │ Input: relevantCandidates[], user                    │    │
│    │                                                       │    │
│    │ allCandidates = [...relevantCandidates, user]        │    │
│    │                                                       │    │
│    │ scoredCandidates = allCandidates.map(candidate => ({ │    │
│    │     candidateId: candidate.id,                       │    │
│    │     candidateName: candidate.full_name,              │    │
│    │     finalScore: calculateAbsoluteScore(candidate),   │    │
│    │     rank: 0,                                         │    │
│    │     isSelf: candidate.id === user.id                 │    │
│    │ }))                                                  │    │
│    │                                                       │    │
│    │ Output: scoredCandidates[]                           │    │
│    │   (cada item com finalScore calculado)               │    │
│    └───────────────────┬──────────────────────────────────┘    │
│                        │                                        │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ PASSO 3: ORDENAÇÃO                                   │    │
│    │                                                       │    │
│    │ Input: scoredCandidates[]                            │    │
│    │                                                       │    │
│    │ scoredCandidates.sort((a, b) => {                    │    │
│    │     // Por score (descendente)                       │    │
│    │     // Tiebreaker: habilidades diferenciais          │    │
│    │ })                                                    │    │
│    │                                                       │    │
│    │ Output: scoredCandidates[] (ordenado)                │    │
│    └───────────────────┬──────────────────────────────────┘    │
│                        │                                        │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ PASSO 4: ATRIBUIÇÃO DE RANKS                         │    │
│    │                                                       │    │
│    │ Input: scoredCandidates[] (ordenado)                 │    │
│    │                                                       │    │
│    │ scoredCandidates.forEach((c, i) => {                 │    │
│    │     c.rank = i + 1                                   │    │
│    │ })                                                    │    │
│    │                                                       │    │
│    │ Output: scoredCandidates[] (com ranks)               │    │
│    └───────────────────┬──────────────────────────────────┘    │
│                        │                                        │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ PASSO 5: PREPARAÇÃO DE RESULTADOS                    │    │
│    │                                                       │    │
│    │ Input: scoredCandidates[] (com ranks)                │    │
│    │                                                       │    │
│    │ top20All = scoredCandidates.slice(0, 20)             │    │
│    │ userEntry = scoredCandidates.find(                   │    │
│    │     c => c.candidateId === user.id                   │    │
│    │ )                                                     │    │
│    │ userInTop20 = userEntry && userEntry.rank <= 20      │    │
│    │ top20 = top20All.filter(                             │    │
│    │     c => c.candidateId !== user.id                   │    │
│    │ )                                                     │    │
│    │                                                       │    │
│    │ result = {                                           │    │
│    │     user: userEntry,                                 │    │
│    │     rankedCandidates: top20,                         │    │
│    │     userInTop20: userInTop20,                        │    │
│    │     stats: {                                         │    │
│    │         totalCandidates: candidates.length,          │    │
│    │         relevantCandidates: relevantCandidates.length│    │
│    │     }                                                 │    │
│    │ }                                                     │    │
│    │                                                       │    │
│    │ postMessage({ success: true, result })               │    │
│    └───────────────────┬──────────────────────────────────┘    │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. RETORNO PARA CAMADA DE SERVIÇO                               │
│                                                                  │
│    worker.onmessage recebe resultado                            │
│    resolve(result)                                               │
│    worker.terminate()                                            │
│                                                                  │
│    Retorno: RankingResult                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. CAMADA DE APLICAÇÃO                                          │
│    src/app/applicant/page.tsx                                    │
│                                                                  │
│    setRankingResult(result)                                     │
│    setLoadingRanking(false)                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. COMPONENTES DE APRESENTAÇÃO                                  │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ UserRanking                                          │    │
│    │   - Recebe: rankingResult.user                       │    │
│    │   - Exibe: Posição, Score                            │    │
│    └──────────────────────────────────────────────────────┘    │
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐    │
│    │ CandidateRankingList                                 │    │
│    │   - Recebe: rankingResult.rankedCandidates           │    │
│    │   - Exibe: Lista dos top 20 candidatos               │    │
│    └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Dados em Cada Etapa

### 1. Dados do Banco de Dados (Supabase)

```typescript
// Tabela: users
{
  id: string (UUID),
  full_name: string | null,
  skills: string[],              // Array de strings
  courses: string[],             // Array de strings
  home_address: {                // JSONB
    latitude: number,
    longitude: number,
    description: string
  } | null,
  profile_analysis: string[]     // Array de strings (habilidades diferenciais)
}
```

### 2. CandidateProfile (Após Transformação)

```typescript
{
  id: string,
  full_name: string | null,
  skills: string[],
  courses: string[],
  freelancer_services: string[],
  experience: string | null,
  academic_background: string | null,
  home_address: {
    latitude: number,
    longitude: number,
    description?: string
  } | null,
  profile_analysis: string[] | null,
  profile_completed: boolean
}
```

### 3. CandidateRankingResult (Após Cálculo)

```typescript
{
  candidateId: string,
  candidateName: string | null,
  finalScore: number,            // 0-100
  rank: number,                  // 1-based
  breakdown: {
    services: number,
    hardSkills: number,
    experience: number,
    courses: number,
    profileCompleteness: number,
    differentialMultiplier: number,
    proximityFactor: number
  },
  similarityHighlights: [],
  isSelf?: boolean
}
```

### 4. RankingResult (Resultado Final)

```typescript
{
  user: CandidateRankingResult,      // Dados do usuário em sessão
  rankedCandidates: CandidateRankingResult[], // Top 20 (excluindo usuário)
  userInTop20: boolean,
  stats: {
    totalCandidates: number,         // Total buscado do banco
    relevantCandidates: number,      // Após filtragem
    withinRadius: number             // Mesmo que relevantCandidates
  }
}
```

## Transformações de Dados

### Transformação 1: Banco → CandidateProfile

```typescript
// src/lib/ranking/service.ts - fetchCandidatesFromDatabase()

row.home_address (JSONB) 
  → UserLocation | null
    - latitude: parseFloat(string | number)
    - longitude: parseFloat(string | number)
    - description: string

row.skills || [] → string[]
row.courses || [] → string[]
row.profile_analysis || [] → string[]
```

### Transformação 2: CandidateProfile → Score

```typescript
// calculateAbsoluteScore(profile)

profile.courses.length 
  → courseScore (0-60)

profile.skills.length 
  → skillScore (0-30)

profile.profile_analysis.length 
  → diffMultiplier (1.0+)
  → diffBonus (0+)

finalScore = min((courseScore + skillScore) × diffMultiplier + diffBonus, 100)
```

### Transformação 3: Scores → Ranks

```typescript
// Ordenação e atribuição de ranks

scoredCandidates.sort((a, b) => {
  // Por score descendente
  // Tiebreaker: habilidades diferenciais
})

scoredCandidates.forEach((c, i) => {
  c.rank = i + 1  // 1-based indexing
})
```

## Fluxo de Erros

### Erro 1: Falha ao Buscar Usuário

```typescript
fetchUserProfile(userId)
  → null (se erro)
    → fetchAndRankCandidates retorna null
      → rankingResult = null
        → UI exibe estado vazio
```

### Erro 2: Falha ao Buscar Candidatos

```typescript
fetchCandidatesFromDatabase(userId)
  → [] (array vazio se erro)
    → relevantCandidates = []
      → scoredCandidates = [user]
        → user sempre rank 1
```

### Erro 3: Erro no Web Worker

```typescript
worker.onerror
  → reject(error)
    → catch no fetchAndRankCandidates
      → rankingResult = null
        → UI exibe estado vazio
```

## Performance e Otimizações

### Pontos de Bottleneck

1. **Query Supabase**: Buscar 200 candidatos
   - Otimização futura: Índices, paginação, filtragem no banco

2. **Filtragem de Habilidades**: O(n) para cada candidato
   - Complexidade: O(n × m) onde n=candidatos, m=skills do usuário

3. **Cálculo de Distância**: Fórmula de Haversine
   - Complexidade: O(n) onde n=candidatos filtrados

4. **Ordenação**: O(n log n)
   - Complexidade: O(n log n) onde n=candidatos relevantes

### Métricas Esperadas

- **Tempo de execução**: 100-500ms para 200 candidatos
- **Memória**: ~50KB para 200 candidatos + resultados
- **CPU**: Processamento em thread paralela (não bloqueia UI)

## Debugging

### Logs Úteis

```typescript
// Adicionar em service.ts para debug

console.log('Total candidates fetched:', candidates.length);
console.log('Candidates with common skills:', withCommonSkills.length);
console.log('Candidates within radius:', relevantCandidates.length);
console.log('User score:', userScore);
console.log('User rank:', userRank);
```

### Validação de Dados

```typescript
// Validar estrutura antes de processar

if (!user || !user.id) {
  throw new Error('Invalid user profile');
}

if (!candidates || !Array.isArray(candidates)) {
  throw new Error('Invalid candidates array');
}
```

