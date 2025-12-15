# Lógica do Algoritmo de Ranking

## Visão Geral

O algoritmo de ranking implementa um sistema competitivo onde todos os candidatos (incluindo o usuário em sessão) são avaliados usando a mesma métrica absoluta, garantindo uma competição justa e transparente.

## Princípios Fundamentais

### 1. Pontuação Absoluta

**Não relativa de similaridade**, mas **absoluta baseada no próprio perfil**.

- Cada candidato recebe um score baseado apenas em seus próprios dados
- O score não depende de comparação com outros candidatos
- Todos competem sob as mesmas regras

### 2. Filtragem Progressiva

O algoritmo aplica filtros em sequência para garantir relevância:

1. **Habilidades Comuns**: Apenas candidatos com pelo menos uma skill em comum
2. **Proximidade Geográfica**: Apenas candidatos dentro de 20km (se usuário tem localização)

### 3. Ranking Competitivo

Todos os candidatos filtrados (incluindo o usuário) são:
- Pontuados com a mesma função
- Ordenados juntos
- Atribuídos ranks sequenciais (1, 2, 3...)

## Fluxo Detalhado do Algoritmo

### Passo 1: Preparação dos Dados

```javascript
// Input recebido pelo Web Worker
{
  user: CandidateProfile,      // Perfil do usuário em sessão
  candidates: CandidateProfile[], // Array de todos os candidatos do banco
  maxDistance: 20000           // Raio máximo em metros (20km)
}
```

### Passo 2: Filtragem de Candidatos

#### 2.1. Remover o Próprio Usuário

```javascript
const otherCandidates = candidates.filter(c => c.id !== user.id);
```

Remove o usuário da lista de candidatos para evitar auto-comparação.

#### 2.2. Filtrar por Habilidades Comuns

```javascript
const withCommonSkills = otherCandidates.filter(c => hasCommonSkills(user, c));
```

**Lógica de `hasCommonSkills()`**:
```javascript
function hasCommonSkills(user, candidate) {
    const userSkills = user.skills || [];
    const candidateSkills = candidate.skills || [];
    
    // Se algum não tem skills, não há match
    if (userSkills.length === 0 || candidateSkills.length === 0) {
        return false;
    }
    
    // Verifica se há pelo menos uma skill em comum
    return userSkills.some(skill => candidateSkills.includes(skill));
}
```

**Exemplo**:
- Usuário: `["JavaScript", "React", "Node.js"]`
- Candidato A: `["Python", "Django", "React"]` → ✅ **Match** (tem "React")
- Candidato B: `["Java", "Spring", "Hibernate"]` → ❌ **No match**

#### 2.3. Filtrar por Proximidade Geográfica

```javascript
const relevantCandidates = withCommonSkills.filter(c => 
    checkProximity(user.home_address, c.home_address, maxDistance)
);
```

**Lógica de `checkProximity()`**:

```javascript
function checkProximity(userLocation, candidateLocation, maxDistance) {
    // Caso 1: Usuário não tem localização
    // Inclui todos os candidatos (não filtra por distância)
    if (!userLocation) {
        return true;
    }
    
    // Caso 2: Usuário tem localização, candidato não tem
    // Exclui candidato (requer localização para comparação justa)
    if (!candidateLocation) {
        return false;
    }
    
    // Caso 3: Ambos têm localização
    // Calcula distância e verifica se está dentro do raio
    const distance = calculateDistance(
        userLocation.latitude, userLocation.longitude,
        candidateLocation.latitude, candidateLocation.longitude
    );
    
    return distance <= maxDistance; // 20000 metros = 20km
}
```

**Fórmula de Haversine** (usada em `calculateDistance()`):
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c

Onde:
- R = raio da Terra (6371 km = 6371000 metros)
- lat1, lon1 = coordenadas do usuário
- lat2, lon2 = coordenadas do candidato
- Δlat = diferença de latitude em radianos
- Δlon = diferença de longitude em radianos
```

**Precisão**: ~0.5% para distâncias < 100km

### Passo 3: Cálculo de Scores Absolutos

```javascript
// Inclui o usuário na lista para competição justa
const allCandidates = [...relevantCandidates, user];

// Calcula score absoluto para cada candidato
const scoredCandidates = allCandidates.map(candidate => ({
    candidateId: candidate.id,
    candidateName: candidate.full_name,
    finalScore: calculateAbsoluteScore(candidate),
    rank: 0,
    isSelf: candidate.id === user.id
}));
```

#### Função `calculateAbsoluteScore(profile)`

Esta é a função **core** do algoritmo. Ela calcula o score baseado apenas nos dados do próprio perfil:

```javascript
function calculateAbsoluteScore(profile) {
    let score = 0;
    const courses = profile.courses || [];
    const skills = profile.skills || [];
    const diffSkills = profile.profile_analysis || [];
    
    // 1. CURSOS (peso máximo: 60 pontos)
    // 10 pontos por curso, máximo de 60 pontos (6+ cursos = 60 pontos)
    const courseScore = Math.min(courses.length * 10, 60);
    score += courseScore;
    
    // 2. HABILIDADES (peso máximo: 30 pontos)
    // 3 pontos por habilidade, máximo de 30 pontos (10+ habilidades = 30 pontos)
    const skillScore = Math.min(skills.length * 3, 30);
    score += skillScore;
    
    // 3. HABILIDADES DIFERENCIAIS (multiplicador e bônus)
    // Multiplicador: 1.0 + (quantidade × 0.05)
    // Bônus adicional: 1 ponto por habilidade diferencial
    const diffMultiplier = diffSkills.length > 0 
        ? 1 + (diffSkills.length * 0.05) 
        : 1.0;
    
    score *= diffMultiplier;
    score += diffSkills.length * 1;
    
    // Limita o score máximo em 100
    return Math.min(score, 100);
}
```

**Exemplo de Cálculo**:

Candidato com:
- 4 cursos → 4 × 10 = 40 pontos
- 8 habilidades → 8 × 3 = 24 pontos (não ultrapassa 30)
- 3 habilidades diferenciais

Cálculo:
```
score = 40 + 24 = 64
diffMultiplier = 1 + (3 × 0.05) = 1.15
score = 64 × 1.15 = 73.6
score = 73.6 + (3 × 1) = 76.6
finalScore = min(76.6, 100) = 76.6
```

**Tabela de Pontuação**:

| Cursos | Habilidades | Dif. Skills | Score Base | Multiplicador | Score Final (aprox) |
|--------|-------------|-------------|------------|---------------|---------------------|
| 0      | 0           | 0           | 0          | 1.0           | 0                   |
| 1      | 1           | 0           | 13         | 1.0           | 13                  |
| 3      | 5           | 0           | 45         | 1.0           | 45                  |
| 6      | 10          | 0           | 90         | 1.0           | 90                  |
| 6+     | 10+         | 2           | 90         | 1.1           | 99                  |
| 6+     | 10+         | 5           | 90         | 1.25          | 100 (cap)           |

### Passo 4: Ordenação

```javascript
scoredCandidates.sort((a, b) => {
    // Critério primário: Score final (descendente)
    if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
    }
    
    // Critério de desempate: Quantidade de habilidades diferenciais
    const candidateA = allCandidates.find(c => c.id === a.candidateId);
    const candidateB = allCandidates.find(c => c.id === b.candidateId);
    const aDiff = candidateA?.profile_analysis?.length || 0;
    const bDiff = candidateB?.profile_analysis?.length || 0;
    
    return bDiff - aDiff; // Mais habilidades diferenciais = melhor
});
```

**Ordem de Critérios**:
1. **Score final** (decrescente) - critério principal
2. **Habilidades diferenciais** (decrescente) - critério de desempate

### Passo 5: Atribuição de Ranks

```javascript
scoredCandidates.forEach((candidate, index) => {
    candidate.rank = index + 1; // Ranks começam em 1 (1-based)
});
```

**Exemplo**:
- Posição 0 no array → Rank 1
- Posição 1 no array → Rank 2
- Posição 2 no array → Rank 3
- ...

### Passo 6: Separação e Seleção

```javascript
// Pega os top 20 de todos os candidatos (incluindo usuário se estiver)
const top20All = scoredCandidates.slice(0, 20);

// Encontra entrada do usuário
const userEntry = scoredCandidates.find(c => c.candidateId === user.id);
const userInTop20 = userEntry && userEntry.rank <= 20;

// Separa usuário dos outros candidatos no top 20
const top20 = top20All.filter(c => c.candidateId !== user.id);
```

**Resultado**:
- `userEntry`: Dados completos do usuário com sua posição
- `top20`: Array com até 20 candidatos (excluindo o usuário)
- `userInTop20`: Boolean indicando se usuário está entre os top 20

## Casos Especiais

### Caso 1: Usuário Sem Habilidades

Se o usuário não tem habilidades (`skills.length === 0`):
- Nenhum candidato passará pelo filtro de habilidades comuns
- `relevantCandidates` será um array vazio
- O usuário ainda será incluído e receberá score baseado apenas em cursos e habilidades diferenciais
- Rank será sempre 1 (único participante)

### Caso 2: Usuário Sem Localização

Se o usuário não tem `home_address`:
- Filtro de proximidade não é aplicado
- Todos os candidatos com habilidades comuns são incluídos
- Candidatos sem localização também são incluídos

### Caso 3: Candidato Sem Localização

Se um candidato não tem `home_address` mas o usuário tem:
- Candidato é excluído do ranking (filtro de proximidade)
- Isso garante comparação justa (todos devem ter localização se o usuário tem)

### Caso 4: Empates

Quando dois candidatos têm o mesmo `finalScore`:
- O critério de desempate é a quantidade de habilidades diferenciais
- Candidato com mais habilidades diferenciais fica acima

### Caso 5: Usuário Fora do Top 20

Se o usuário está na posição 25, por exemplo:
- `userEntry.rank = 25`
- `userInTop20 = false`
- `top20` contém os 20 primeiros candidatos (excluindo o usuário)
- UI deve mostrar alerta informando que usuário não está nos top 20

## Complexidade Computacional

- **Tempo**:
  - Filtragem: O(n) onde n = número de candidatos
  - Cálculo de scores: O(n)
  - Ordenação: O(n log n)
  - **Total: O(n log n)**

- **Espaço**:
  - O(n) para armazenar candidatos e scores

## Otimizações Futuras

1. **Cache**: Cachear resultados para evitar recálculo
2. **Indexação Geográfica**: Usar PostGIS para filtrar no banco
3. **Paginação**: Processar em lotes para muitos candidatos
4. **Workers Múltiplos**: Paralelizar cálculo de scores

