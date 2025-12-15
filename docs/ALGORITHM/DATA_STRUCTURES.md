# Estruturas de Dados

## Visão Geral

Este documento detalha todas as interfaces TypeScript e estruturas de dados utilizadas no sistema de ranking.

## Localização

Todas as interfaces estão definidas em `src/lib/ranking/types.ts`.

## Interfaces Principais

### UserLocation

Representa uma localização geográfica com coordenadas.

```typescript
export interface UserLocation {
    latitude: number;      // Latitude em graus (-90 a 90)
    longitude: number;     // Longitude em graus (-180 a 180)
    description?: string;  // Descrição opcional do endereço
}
```

**Exemplo**:
```typescript
const location: UserLocation = {
    latitude: -23.5505,
    longitude: -46.6333,
    description: "São Paulo, SP, Brasil"
};
```

### CandidateProfile

Representa o perfil completo de um candidato/usuário.

```typescript
export interface CandidateProfile {
    id: string;                              // UUID do usuário
    full_name: string | null;                // Nome completo
    description: string | null;              // Descrição do perfil
    skills: string[];                        // Array de habilidades técnicas
    courses: string[];                       // Array de cursos realizados
    freelancer_services: string[];           // Array de serviços oferecidos
    experience: string | null;               // Texto sobre experiência
    academic_background: string | null;      // Formação acadêmica
    home_address: UserLocation | null;       // Localização geográfica
    profile_analysis: string[] | null;       // Habilidades diferenciais (avaliações)
    profile_completed: boolean;              // Se perfil está completo
    // Campos futuros (opcionais)
    experience_years?: number | null;        // Anos de experiência
    profile_photo?: boolean | null;          // Se tem foto de perfil
    bio?: string | null;                     // Biografia
    education?: Array<{                      // Formação detalhada
        level: string;                       // Nível (ex: "Bacharelado")
        field: string;                       // Área (ex: "Ciência da Computação")
    }> | null;
}
```

**Exemplo**:
```typescript
const profile: CandidateProfile = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    full_name: "João Silva",
    description: "Desenvolvedor Full Stack",
    skills: ["JavaScript", "React", "Node.js", "TypeScript"],
    courses: ["Curso de React", "Node.js Avançado"],
    freelancer_services: [],
    experience: "5 anos de experiência",
    academic_background: "Bacharelado em Ciência da Computação",
    home_address: {
        latitude: -23.5505,
        longitude: -46.6333,
        description: "São Paulo, SP"
    },
    profile_analysis: ["Liderança", "Comunicação"],
    profile_completed: true
};
```

### CandidateRankingResult

Resultado do ranking para um único candidato.

```typescript
export interface CandidateRankingResult {
    candidateId: string;                     // ID do candidato
    candidateName: string | null;            // Nome do candidato
    finalScore: number;                      // Score final (0-100)
    rank: number;                            // Posição no ranking (1-based)
    breakdown: ScoreBreakdown;               // Breakdown detalhado do score
    similarityHighlights: SimilarityHighlight[]; // Destaques de similaridade
    isSelf?: boolean;                        // True se é o próprio usuário
}
```

**Exemplo**:
```typescript
const result: CandidateRankingResult = {
    candidateId: "123e4567-e89b-12d3-a456-426614174000",
    candidateName: "João Silva",
    finalScore: 85.5,
    rank: 3,
    breakdown: {
        services: 0,
        hardSkills: 0,
        experience: 0,
        courses: 0,
        profileCompleteness: 0,
        differentialMultiplier: 1.0,
        proximityFactor: 100
    },
    similarityHighlights: [],
    isSelf: false
};
```

### RankingResult

Resultado completo do ranking incluindo usuário e outros candidatos.

```typescript
export interface RankingResult {
    user: CandidateRankingResult;            // Posição e score do usuário
    rankedCandidates: CandidateRankingResult[]; // Top 20 candidatos (excluindo usuário)
    userInTop20: boolean;                    // Se usuário está nos top 20
    stats: {
        totalCandidates: number;             // Total de candidatos analisados
        relevantCandidates: number;          // Candidatos com habilidades comuns
        withinRadius: number;                // Candidatos dentro do raio (mesmo que relevantCandidates)
        averageScore?: number;               // Score médio (opcional)
    };
}
```

**Exemplo**:
```typescript
const rankingResult: RankingResult = {
    user: {
        candidateId: "user-id",
        candidateName: "Você",
        finalScore: 75.0,
        rank: 5,
        breakdown: { ... },
        similarityHighlights: [],
        isSelf: true
    },
    rankedCandidates: [
        { candidateId: "candidate-1", ... },
        { candidateId: "candidate-2", ... },
        // ... até 20 candidatos
    ],
    userInTop20: true,
    stats: {
        totalCandidates: 150,
        relevantCandidates: 45,
        withinRadius: 45
    }
};
```

### ScoreBreakdown

Breakdown detalhado de como o score foi calculado (atualmente não usado, preparado para futuro).

```typescript
export interface ScoreBreakdown {
    services: number;                        // Score de serviços (0-100)
    hardSkills: number;                      // Score de habilidades (0-100)
    experience: number;                      // Score de experiência (0-100)
    courses: number;                         // Score de cursos (0-100)
    profileCompleteness: number;             // Score de completude (0-100)
    differentialMultiplier: number;          // Multiplicador de habilidades diferenciais
    proximityFactor: number;                 // Fator de proximidade (0-100)
}
```

### SimilarityHighlight

Destaque de similaridade entre usuário e candidato (atualmente não usado, preparado para futuro).

```typescript
export interface SimilarityHighlight {
    type: 'services' | 'skills';             // Tipo de destaque
    category: string;                        // Categoria
    count: number;                           // Quantidade
    items: string[];                         // Itens específicos
}
```

### ProximityResult

Resultado da verificação de proximidade geográfica (usado internamente).

```typescript
export interface ProximityResult {
    withinRadius: boolean;                   // Se está dentro do raio
    proximityFactor: number;                 // Fator de proximidade (0-1)
    distance?: number;                       // Distância em metros (opcional)
}
```

## Interfaces de Configuração (Futuro)

Estas interfaces estão definidas mas não são utilizadas atualmente. Estão preparadas para implementação futura.

### RankingWeights

Pesos para cada componente do score.

```typescript
export interface RankingWeights {
    serviceCategories: number;               // Peso de serviços
    hardSkills: number;                      // Peso de habilidades
    experience: number;                      // Peso de experiência
    courses: number;                         // Peso de cursos
    profileCompleteness: number;             // Peso de completude
}
```

### CategoryConfig

Configuração de hierarquia de categorias.

```typescript
export interface CategoryConfig {
    name: string;                            // Nome da categoria
    subcategories: string[];                 // Subcategorias
    weights: {
        baseMatch: number;                   // Peso base para match
        breadthBonus: number;                // Bônus por amplitude
        completenessBonus: number;           // Bônus por completude
    };
}
```

### ExperienceConfig

Configuração para cálculo de experiência.

```typescript
export interface ExperienceConfig {
    maxYears: number;                        // Anos máximos para normalização
    weightPerYear: number;                   // Peso por ano
    diminishingFactor: number;               // Fator de diminuição para anos extras
}
```

### DifferentialMultipliers

Multiplicadores para habilidades diferenciais.

```typescript
export interface DifferentialMultipliers {
    [key: string]: number;                   // Key: nome da habilidade, Value: multiplicador
}
```

### RankingAlgorithmConfig

Configuração completa do algoritmo (não usado atualmente).

```typescript
export interface RankingAlgorithmConfig {
    maxDistance: number;                     // Distância máxima em metros
    maxCandidates: number;                   // Máximo de candidatos a retornar
    weights: RankingWeights;                 // Pesos dos componentes
    categoryHierarchy: Record<string, CategoryConfig>; // Hierarquia de categorias
    differentialMultipliers: DifferentialMultipliers;  // Multiplicadores diferenciais
    experienceConfig: ExperienceConfig;      // Configuração de experiência
}
```

## Transformações de Dados

### Banco de Dados → CandidateProfile

```typescript
// Entrada: Row do Supabase
{
    id: string,
    full_name: string | null,
    skills: string[],
    courses: string[],
    home_address: Json | null,  // JSONB do PostgreSQL
    // ...
}

// Transformação
{
    id: row.id,
    full_name: row.full_name,
    skills: row.skills || [],
    courses: row.courses || [],
    home_address: row.home_address ? {
        latitude: parseFloat(row.home_address.latitude),
        longitude: parseFloat(row.home_address.longitude),
        description: row.home_address.description
    } : null,
    // ...
}

// Saída: CandidateProfile
```

### CandidateProfile → CandidateRankingResult

```typescript
// Entrada: CandidateProfile
const profile: CandidateProfile = { ... };

// Transformação
const result: CandidateRankingResult = {
    candidateId: profile.id,
    candidateName: profile.full_name,
    finalScore: calculateAbsoluteScore(profile),
    rank: 0, // Será atribuído após ordenação
    breakdown: { /* valores padrão */ },
    similarityHighlights: [],
    isSelf: profile.id === user.id
};

// Saída: CandidateRankingResult
```

## Validação de Dados

### Type Guards Úteis

```typescript
function isValidUserLocation(location: any): location is UserLocation {
    return (
        location !== null &&
        typeof location.latitude === 'number' &&
        typeof location.longitude === 'number' &&
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180
    );
}

function isValidCandidateProfile(profile: any): profile is CandidateProfile {
    return (
        profile !== null &&
        typeof profile.id === 'string' &&
        Array.isArray(profile.skills) &&
        Array.isArray(profile.courses) &&
        (profile.home_address === null || isValidUserLocation(profile.home_address))
    );
}
```

## Convenções e Boas Práticas

### Arrays

- Sempre inicializar como array vazio `[]` se possível `null`
- Usar `|| []` para garantir array mesmo se `null` ou `undefined`

### Null Safety

- Usar `| null` para campos opcionais que podem ser explicitamente `null`
- Usar `?:` para campos opcionais que podem não existir

### Números

- Scores sempre entre 0 e 100
- Ranks sempre base-1 (começam em 1, não 0)
- Distâncias sempre em metros

### Strings

- IDs sempre UUIDs (strings)
- Nomes podem ser `null` se não informados

## Exemplos de Uso

### Criando um Perfil

```typescript
const newProfile: CandidateProfile = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    full_name: "Maria Santos",
    description: null,
    skills: ["JavaScript", "TypeScript"],
    courses: ["React Fundamentals"],
    freelancer_services: [],
    experience: null,
    academic_background: null,
    home_address: {
        latitude: -23.5505,
        longitude: -46.6333
    },
    profile_analysis: [],
    profile_completed: false
};
```

### Verificando Dados

```typescript
function validateRankingResult(result: RankingResult): boolean {
    if (!result.user || !result.rankedCandidates) {
        return false;
    }
    
    if (result.user.finalScore < 0 || result.user.finalScore > 100) {
        return false;
    }
    
    if (result.user.rank < 1) {
        return false;
    }
    
    return true;
}
```

