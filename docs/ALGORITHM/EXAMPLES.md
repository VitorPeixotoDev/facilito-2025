# Exemplos Práticos

## Visão Geral

Este documento fornece exemplos práticos de como usar o sistema de ranking em diferentes cenários.

## Exemplos Básicos

### Exemplo 1: Buscar Ranking Completo

```typescript
import { fetchAndRankCandidates } from '@/lib/ranking/service';

async function getRanking(userId: string) {
    const result = await fetchAndRankCandidates(userId);
    
    if (!result) {
        console.error('Erro ao calcular ranking');
        return;
    }
    
    // Informações do usuário
    console.log(`Sua posição: #${result.user.rank}`);
    console.log(`Seu score: ${result.user.finalScore.toFixed(1)}`);
    
    // Top candidatos
    result.rankedCandidates.forEach((candidate, index) => {
        console.log(
            `${candidate.rank}. ${candidate.candidateName} - ` +
            `Score: ${candidate.finalScore.toFixed(1)}`
        );
    });
    
    return result;
}
```

### Exemplo 2: Verificar se Usuário Está nos Top 20

```typescript
import { fetchAndRankCandidates } from '@/lib/ranking/service';

async function checkTop20(userId: string): Promise<boolean> {
    const result = await fetchAndRankCandidates(userId);
    
    if (!result) {
        return false;
    }
    
    return result.userInTop20;
}

// Uso
const isTop20 = await checkTop20('user-id');
if (isTop20) {
    console.log('Parabéns! Você está nos top 20! 🎉');
} else {
    console.log(`Você está na posição ${result.user.rank}`);
}
```

### Exemplo 3: Buscar Apenas Candidatos do Banco

```typescript
import { fetchCandidatesFromDatabase } from '@/lib/ranking/service';

async function getAllCandidates(userId: string) {
    const candidates = await fetchCandidatesFromDatabase(userId, 500);
    
    console.log(`Total de candidatos: ${candidates.length}`);
    
    // Filtrar candidatos com localização
    const withLocation = candidates.filter(c => c.home_address !== null);
    console.log(`Candidatos com localização: ${withLocation.length}`);
    
    // Filtrar candidatos com habilidades
    const withSkills = candidates.filter(c => c.skills.length > 0);
    console.log(`Candidatos com habilidades: ${withSkills.length}`);
    
    return candidates;
}
```

## Exemplos de Cálculo de Distância

### Exemplo 4: Calcular Distância entre Dois Pontos

```typescript
import { calculateDistance } from '@/lib/ranking/utils/distance';

// Distância entre São Paulo e Rio de Janeiro
const distance = calculateDistance(
    -23.5505, -46.6333,  // São Paulo
    -22.9068, -43.1729   // Rio de Janeiro
);

console.log(`Distância: ${distance} metros`);
console.log(`Distância: ${(distance / 1000).toFixed(2)} km`);
// Resultado: ~357000 metros (357 km)
```

### Exemplo 5: Verificar Proximidade

```typescript
import { checkProximity } from '@/lib/ranking/utils/distance';

function isWithinRadius(
    userLat: number,
    userLon: number,
    candidateLat: number,
    candidateLon: number,
    radiusKm: number
): boolean {
    const userLocation = { latitude: userLat, longitude: userLon };
    const candidateLocation = { latitude: candidateLat, longitude: candidateLon };
    const maxDistance = radiusKm * 1000; // Converter km para metros
    
    const result = checkProximity(userLocation, candidateLocation, maxDistance);
    return result.withinRadius;
}

// Uso
const isNear = isWithinRadius(
    -23.5505, -46.6333,  // São Paulo
    -23.5510, -46.6340,  // Perto de São Paulo
    20  // 20km
);

console.log(isNear ? 'Dentro do raio' : 'Fora do raio');
```

## Exemplos de Integração com React

### Exemplo 6: Componente com Ranking

```typescript
'use client';

import { useState, useEffect } from 'react';
import { fetchAndRankCandidates } from '@/lib/ranking/service';
import type { RankingResult } from '@/lib/ranking/types';

export function RankingDisplay({ userId }: { userId: string }) {
    const [ranking, setRanking] = useState<RankingResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        async function loadRanking() {
            try {
                setLoading(true);
                const result = await fetchAndRankCandidates(userId);
                
                if (!result) {
                    setError('Erro ao carregar ranking');
                    return;
                }
                
                setRanking(result);
            } catch (err) {
                setError('Erro inesperado');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        
        loadRanking();
    }, [userId]);
    
    if (loading) {
        return <div>Carregando ranking...</div>;
    }
    
    if (error) {
        return <div>Erro: {error}</div>;
    }
    
    if (!ranking) {
        return <div>Nenhum dado disponível</div>;
    }
    
    return (
        <div>
            <h2>Sua Posição: #{ranking.user.rank}</h2>
            <p>Score: {ranking.user.finalScore.toFixed(1)}</p>
            
            {!ranking.userInTop20 && (
                <p>Você não está nos top 20. Continue melhorando!</p>
            )}
            
            <h3>Top Candidatos</h3>
            <ol>
                {ranking.rankedCandidates.map(candidate => (
                    <li key={candidate.candidateId}>
                        {candidate.candidateName} - Score: {candidate.finalScore.toFixed(1)}
                    </li>
                ))}
            </ol>
        </div>
    );
}
```

### Exemplo 7: Hook Customizado para Ranking

```typescript
import { useState, useEffect } from 'react';
import { fetchAndRankCandidates } from '@/lib/ranking/service';
import type { RankingResult } from '@/lib/ranking/types';

export function useRanking(userId: string | null) {
    const [ranking, setRanking] = useState<RankingResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    useEffect(() => {
        if (!userId) {
            setRanking(null);
            return;
        }
        
        async function loadRanking() {
            try {
                setLoading(true);
                setError(null);
                
                const result = await fetchAndRankCandidates(userId);
                setRanking(result);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Erro desconhecido'));
            } finally {
                setLoading(false);
            }
        }
        
        loadRanking();
    }, [userId]);
    
    return { ranking, loading, error, refetch: () => loadRanking() };
}

// Uso
function MyComponent() {
    const { ranking, loading, error } = useRanking('user-id');
    
    if (loading) return <div>Carregando...</div>;
    if (error) return <div>Erro: {error.message}</div>;
    if (!ranking) return <div>Sem dados</div>;
    
    return <div>Sua posição: #{ranking.user.rank}</div>;
}
```

## Exemplos Avançados

### Exemplo 8: Filtrar Candidatos por Múltiplos Critérios

```typescript
import { fetchCandidatesFromDatabase } from '@/lib/ranking/service';
import { checkProximity } from '@/lib/ranking/utils/distance';

async function findRelevantCandidates(
    userId: string,
    userSkills: string[],
    userLocation: { latitude: number; longitude: number } | null,
    maxDistance: number = 20000
) {
    // Buscar todos os candidatos
    const allCandidates = await fetchCandidatesFromDatabase(userId);
    
    // Filtrar por habilidades comuns
    const withCommonSkills = allCandidates.filter(candidate => {
        if (candidate.skills.length === 0) return false;
        return candidate.skills.some(skill => userSkills.includes(skill));
    });
    
    // Filtrar por proximidade (se usuário tem localização)
    const nearby = userLocation
        ? withCommonSkills.filter(candidate => {
              if (!candidate.home_address) return false;
              return checkProximity(
                  userLocation,
                  candidate.home_address,
                  maxDistance
              ).withinRadius;
          })
        : withCommonSkills;
    
    return {
        total: allCandidates.length,
        withCommonSkills: withCommonSkills.length,
        nearby: nearby.length,
        candidates: nearby
    };
}
```

### Exemplo 9: Calcular Score Manualmente (Para Testes)

```typescript
function calculateScore(
    courses: string[],
    skills: string[],
    diffSkills: string[]
): number {
    // Cursos: 10 pontos por curso, máximo 60
    const courseScore = Math.min(courses.length * 10, 60);
    
    // Habilidades: 3 pontos por habilidade, máximo 30
    const skillScore = Math.min(skills.length * 3, 30);
    
    // Score base
    let score = courseScore + skillScore;
    
    // Multiplicador de habilidades diferenciais
    const diffMultiplier = diffSkills.length > 0
        ? 1 + (diffSkills.length * 0.05)
        : 1.0;
    
    score *= diffMultiplier;
    
    // Bônus de habilidades diferenciais
    score += diffSkills.length * 1;
    
    // Cap em 100
    return Math.min(score, 100);
}

// Teste
const score = calculateScore(
    ['Curso 1', 'Curso 2', 'Curso 3'],  // 3 cursos = 30 pontos
    ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'],  // 5 skills = 15 pontos
    ['Liderança', 'Comunicação']  // 2 diff skills = multiplicador 1.1
);
// Score base: 30 + 15 = 45
// Com multiplicador: 45 * 1.1 = 49.5
// Com bônus: 49.5 + 2 = 51.5
console.log(`Score: ${score.toFixed(1)}`); // 51.5
```

### Exemplo 10: Análise de Ranking

```typescript
import { fetchAndRankCandidates } from '@/lib/ranking/service';

async function analyzeRanking(userId: string) {
    const result = await fetchAndRankCandidates(userId);
    
    if (!result) {
        return null;
    }
    
    const analysis = {
        userRank: result.user.rank,
        userScore: result.user.finalScore,
        totalCandidates: result.stats.totalCandidates,
        relevantCandidates: result.stats.relevantCandidates,
        inTop20: result.userInTop20,
        top3Scores: result.rankedCandidates.slice(0, 3).map(c => c.finalScore),
        averageScore: result.rankedCandidates.reduce((sum, c) => sum + c.finalScore, 0) /
                     result.rankedCandidates.length,
        scoreGapToTop: result.rankedCandidates[0]?.finalScore - result.user.finalScore || 0
    };
    
    // Insights
    if (analysis.userRank === 1) {
        console.log('🏆 Você está em primeiro lugar!');
    } else if (analysis.inTop20) {
        console.log(`✅ Você está na posição ${analysis.userRank} (top 20)`);
    } else {
        console.log(`📊 Você está na posição ${analysis.userRank} (fora dos top 20)`);
        console.log(`Gap para o primeiro: ${analysis.scoreGapToTop.toFixed(1)} pontos`);
    }
    
    console.log(`Score médio dos top candidatos: ${analysis.averageScore.toFixed(1)}`);
    
    return analysis;
}
```

## Exemplos de Testes

### Exemplo 11: Mock para Testes

```typescript
// __mocks__/ranking.ts
export const mockRankingResult: RankingResult = {
    user: {
        candidateId: 'user-id',
        candidateName: 'Usuário Teste',
        finalScore: 75.0,
        rank: 5,
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
        isSelf: true
    },
    rankedCandidates: [
        {
            candidateId: 'candidate-1',
            candidateName: 'Candidato 1',
            finalScore: 90.0,
            rank: 1,
            breakdown: { /* ... */ },
            similarityHighlights: [],
            isSelf: false
        },
        // ... mais candidatos
    ],
    userInTop20: true,
    stats: {
        totalCandidates: 100,
        relevantCandidates: 50,
        withinRadius: 50
    }
};

export async function fetchAndRankCandidates(userId: string) {
    return Promise.resolve(mockRankingResult);
}
```

### Exemplo 12: Teste de Cálculo de Score

```typescript
describe('calculateAbsoluteScore', () => {
    it('deve calcular score corretamente', () => {
        const profile = {
            id: 'test-id',
            full_name: 'Test',
            courses: ['Curso 1', 'Curso 2', 'Curso 3'],
            skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'],
            profile_analysis: ['Liderança']
        };
        
        // Score esperado:
        // Cursos: 3 * 10 = 30
        // Skills: 5 * 3 = 15
        // Base: 45
        // Multiplicador: 1.05 (1 habilidade diferencial)
        // Após multiplicador: 45 * 1.05 = 47.25
        // Bônus: 1
        // Final: 48.25
        
        const score = calculateAbsoluteScore(profile);
        expect(score).toBeCloseTo(48.25, 1);
    });
});
```

## Boas Práticas

### Sempre Verificar Resultado

```typescript
const result = await fetchAndRankCandidates(userId);
if (!result) {
    // Tratar erro
    return;
}
// Usar result
```

### Usar Loading States

```typescript
const [loading, setLoading] = useState(true);
// ...
setLoading(false);
```

### Tratar Erros Adequadamente

```typescript
try {
    const result = await fetchAndRankCandidates(userId);
    // ...
} catch (error) {
    console.error('Erro:', error);
    // Exibir mensagem ao usuário
}
```

