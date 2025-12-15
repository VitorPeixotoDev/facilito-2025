# Referência de API

## Visão Geral

Este documento fornece referência completa de todas as funções públicas do sistema de ranking.

## Módulo: service.ts

### fetchCandidatesFromDatabase

Busca candidatos do banco de dados.

```typescript
function fetchCandidatesFromDatabase(
    userId: string,
    limit?: number
): Promise<CandidateProfile[]>
```

**Parâmetros**:
- `userId` (string): ID do usuário em sessão (será excluído dos resultados)
- `limit` (number, opcional): Número máximo de candidatos a buscar (padrão: 200)

**Retorno**: Promise que resolve para array de `CandidateProfile`

**Exemplo**:
```typescript
const candidates = await fetchCandidatesFromDatabase('user-id', 200);
console.log(`Encontrados ${candidates.length} candidatos`);
```

**Erros**: Retorna array vazio `[]` em caso de erro (não lança exceção)

---

### fetchUserProfile

Busca perfil do usuário do banco de dados.

```typescript
function fetchUserProfile(userId: string): Promise<CandidateProfile | null>
```

**Parâmetros**:
- `userId` (string): ID do usuário

**Retorno**: Promise que resolve para `CandidateProfile` ou `null` se não encontrado

**Exemplo**:
```typescript
const userProfile = await fetchUserProfile('user-id');
if (!userProfile) {
    console.error('Perfil não encontrado');
    return;
}
console.log(`Nome: ${userProfile.full_name}`);
```

**Erros**: Retorna `null` em caso de erro (não lança exceção)

---

### fetchAndRankCandidates

**Função principal** - Busca e ranqueia candidatos.

```typescript
function fetchAndRankCandidates(
    userId: string,
    maxDistance?: number
): Promise<RankingResult | null>
```

**Parâmetros**:
- `userId` (string): ID do usuário em sessão
- `maxDistance` (number, opcional): Distância máxima em metros (padrão: 20000 = 20km)

**Retorno**: Promise que resolve para `RankingResult` ou `null` em caso de erro

**Exemplo**:
```typescript
const result = await fetchAndRankCandidates('user-id', 20000);
if (!result) {
    console.error('Erro ao calcular ranking');
    return;
}

console.log(`Sua posição: #${result.user.rank}`);
console.log(`Score: ${result.user.finalScore}`);
console.log(`Candidatos no ranking: ${result.rankedCandidates.length}`);
```

**Erros**: Retorna `null` em caso de erro (não lança exceção)

**Processamento**:
1. Busca perfil do usuário
2. Busca candidatos do banco
3. Processa ranking em Web Worker paralelo
4. Retorna resultados

---

## Módulo: utils/distance.ts

### calculateDistance

Calcula distância entre duas coordenadas geográficas usando fórmula de Haversine.

```typescript
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number
```

**Parâmetros**:
- `lat1` (number): Latitude do primeiro ponto em graus (-90 a 90)
- `lon1` (number): Longitude do primeiro ponto em graus (-180 a 180)
- `lat2` (number): Latitude do segundo ponto em graus
- `lon2` (number): Longitude do segundo ponto em graus

**Retorno**: Distância em metros (number)

**Exemplo**:
```typescript
// Distância entre São Paulo e Rio de Janeiro
const distance = calculateDistance(
    -23.5505, -46.6333,  // São Paulo
    -22.9068, -43.1729   // Rio de Janeiro
);
console.log(`Distância: ${distance} metros (${distance / 1000} km)`);
// Resultado aproximado: ~357000 metros (357 km)
```

**Fórmula**: Haversine
**Precisão**: ~0.5% para distâncias < 100km

---

### checkProximity

Verifica se um candidato está dentro do raio máximo e calcula fator de proximidade.

```typescript
function checkProximity(
    userLocation: UserLocation | null,
    candidateLocation: UserLocation | null,
    maxDistance?: number
): ProximityResult
```

**Parâmetros**:
- `userLocation` (UserLocation | null): Localização do usuário
- `candidateLocation` (UserLocation | null): Localização do candidato
- `maxDistance` (number, opcional): Distância máxima em metros (padrão: 20000)

**Retorno**: `ProximityResult` com:
- `withinRadius` (boolean): Se está dentro do raio
- `proximityFactor` (number): Fator de proximidade (0-1)
- `distance` (number, opcional): Distância em metros

**Exemplo**:
```typescript
const userLoc = { latitude: -23.5505, longitude: -46.6333 };
const candidateLoc = { latitude: -23.5510, longitude: -46.6340 };

const result = checkProximity(userLoc, candidateLoc, 20000);
if (result.withinRadius) {
    console.log(`Dentro do raio! Distância: ${result.distance}m`);
    console.log(`Fator de proximidade: ${result.proximityFactor}`);
} else {
    console.log('Fora do raio');
}
```

**Lógica Especial**:
- Se `userLocation` é `null`: retorna `withinRadius: true` (inclui todos)
- Se `candidateLocation` é `null` mas `userLocation` não é: retorna `withinRadius: false` (exclui)

---

## Web Worker (Interno)

As funções abaixo são executadas dentro do Web Worker e não são acessíveis diretamente. Documentadas para referência.

### calculateAbsoluteScore (Worker)

Calcula score absoluto baseado no próprio perfil.

```javascript
function calculateAbsoluteScore(profile: CandidateProfile): number
```

**Parâmetros**:
- `profile` (CandidateProfile): Perfil do candidato

**Retorno**: Score de 0 a 100 (number)

**Lógica**:
1. Cursos: `min(courses.length × 10, 60)` pontos
2. Habilidades: `min(skills.length × 3, 30)` pontos
3. Habilidades diferenciais: multiplicador `1 + (count × 0.05)` e bônus `count × 1`
4. Score final: `min((courseScore + skillScore) × multiplier + bonus, 100)`

---

### hasCommonSkills (Worker)

Verifica se há habilidades em comum entre usuário e candidato.

```javascript
function hasCommonSkills(
    user: CandidateProfile,
    candidate: CandidateProfile
): boolean
```

**Parâmetros**:
- `user` (CandidateProfile): Perfil do usuário
- `candidate` (CandidateProfile): Perfil do candidato

**Retorno**: `true` se há pelo menos uma habilidade em comum, `false` caso contrário

**Lógica**:
- Retorna `false` se algum não tem habilidades
- Retorna `true` se há interseção entre arrays de skills

---

## Componentes React

### UserRanking

Componente para exibir posição do usuário no ranking.

```typescript
interface UserRankingProps {
    profile: UserProfile;
    userId: string;
    userRanking?: CandidateRankingResult | null;
    loading?: boolean;
}

function UserRanking(props: UserRankingProps): JSX.Element
```

**Props**:
- `profile` (UserProfile): Perfil do usuário (do contexto de autenticação)
- `userId` (string): ID do usuário
- `userRanking` (CandidateRankingResult | null, opcional): Resultado do ranking do usuário
- `loading` (boolean, opcional): Se está carregando

**Renderiza**:
- Alerta se perfil incompleto (sem skills ou localização)
- Posição do usuário no ranking
- Score do usuário
- Estatísticas (habilidades diferenciais, skills, cursos)

---

### CandidateRankingList

Componente para listar candidatos ranqueados.

```typescript
interface CandidateRankingListProps {
    candidates: CandidateRankingResult[];
    loading?: boolean;
}

function CandidateRankingList(props: CandidateRankingListProps): JSX.Element
```

**Props**:
- `candidates` (CandidateRankingResult[]): Array de candidatos ranqueados
- `loading` (boolean, opcional): Se está carregando

**Renderiza**:
- Lista de candidatos com rank, nome e score
- Destaques de similaridade (se houver)
- Loading state

---

## Exemplos de Uso Completos

### Exemplo 1: Buscar e Exibir Ranking

```typescript
import { fetchAndRankCandidates } from '@/lib/ranking/service';

async function displayRanking(userId: string) {
    try {
        const result = await fetchAndRankCandidates(userId);
        
        if (!result) {
            console.error('Erro ao calcular ranking');
            return;
        }
        
        // Exibir posição do usuário
        console.log(`Sua posição: #${result.user.rank}`);
        console.log(`Seu score: ${result.user.finalScore.toFixed(1)}`);
        
        // Exibir se está nos top 20
        if (result.userInTop20) {
            console.log('Você está nos top 20! 🎉');
        } else {
            console.log(`Você está na posição ${result.user.rank} (fora dos top 20)`);
        }
        
        // Exibir estatísticas
        console.log(`Total de candidatos: ${result.stats.totalCandidates}`);
        console.log(`Candidatos relevantes: ${result.stats.relevantCandidates}`);
        
        // Exibir top 3
        result.rankedCandidates.slice(0, 3).forEach((candidate, index) => {
            console.log(`${index + 1}. ${candidate.candidateName} - Score: ${candidate.finalScore}`);
        });
        
    } catch (error) {
        console.error('Erro:', error);
    }
}
```

### Exemplo 2: Verificar Proximidade

```typescript
import { checkProximity } from '@/lib/ranking/utils/distance';

function filterByProximity(
    userLocation: UserLocation,
    candidates: CandidateProfile[],
    maxDistance: number = 20000
): CandidateProfile[] {
    return candidates.filter(candidate => {
        const result = checkProximity(
            userLocation,
            candidate.home_address,
            maxDistance
        );
        return result.withinRadius;
    });
}

// Uso
const nearbyCandidates = filterByProximity(
    { latitude: -23.5505, longitude: -46.6333 },
    allCandidates,
    20000 // 20km
);
console.log(`Candidatos próximos: ${nearbyCandidates.length}`);
```

### Exemplo 3: Calcular Distância

```typescript
import { calculateDistance } from '@/lib/ranking/utils/distance';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const distanceMeters = calculateDistance(lat1, lon1, lat2, lon2);
    return distanceMeters / 1000; // Converter para km
}

// Distância entre duas cidades
const distance = getDistanceKm(
    -23.5505, -46.6333,  // São Paulo
    -22.9068, -43.1729   // Rio de Janeiro
);
console.log(`Distância: ${distance.toFixed(2)} km`);
```

## Tratamento de Erros

### Padrão de Erro

Todas as funções públicas seguem o padrão:
- **Não lançam exceções** para erros esperados (dados não encontrados, etc.)
- **Retornam valores padrão**: `null` ou `[]`
- **Logam erros** no console para debugging

### Exemplo de Tratamento

```typescript
const result = await fetchAndRankCandidates(userId);

if (!result) {
    // Erro ao buscar ou calcular ranking
    // Exibir mensagem ao usuário
    showError('Não foi possível carregar o ranking');
    return;
}

// Sucesso - processar resultado
processRankingResult(result);
```

## Performance

### Tempos Esperados

- `fetchCandidatesFromDatabase`: 50-200ms (depende do banco)
- `fetchUserProfile`: 20-100ms
- `fetchAndRankCandidates`: 200-500ms (incluindo processamento)
- `calculateDistance`: <1ms por chamada
- `checkProximity`: <1ms por chamada

### Otimizações

- Processamento em Web Worker (não bloqueia UI)
- Limite padrão de 200 candidatos
- Filtragem progressiva reduz candidatos processados

