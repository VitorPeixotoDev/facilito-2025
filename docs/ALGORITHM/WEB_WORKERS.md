# Processamento Paralelo com Web Workers

## Visão Geral

O sistema de ranking utiliza **Web Workers** para processar cálculos pesados em uma thread paralela, garantindo que a interface do usuário permaneça responsiva durante o processamento.

## Por que Web Workers?

### Problema

Cálculos de ranking podem ser computacionalmente intensos:
- Filtragem de centenas de candidatos
- Cálculos de distância geográfica
- Ordenação de arrays grandes
- Cálculos de scores múltiplos

Se executados na **main thread** (thread principal), esses cálculos causariam:
- ❌ Congelamento da UI
- ❌ Experiência ruim do usuário
- ❌ Timeout em navegadores (se muito longo)

### Solução

Web Workers executam código em uma **thread separada**, permitindo:
- ✅ UI permanece responsiva
- ✅ Processamento paralelo não bloqueia
- ✅ Melhor experiência do usuário

## Implementação

### Arquitetura do Web Worker

```
┌─────────────────────────────────────────┐
│         Main Thread (UI)                │
│  - React Components                     │
│  - Event Handlers                       │
│  - State Management                     │
└──────────────┬──────────────────────────┘
               │
               │ postMessage(data)
               │
               ▼
┌─────────────────────────────────────────┐
│      Web Worker (Thread Paralelo)       │
│  - Cálculos pesados                     │
│  - Filtragem                            │
│  - Ordenação                            │
└──────────────┬──────────────────────────┘
               │
               │ postMessage(result)
               │
               ▼
┌─────────────────────────────────────────┐
│         Main Thread (UI)                │
│  - Recebe resultados                    │
│  - Atualiza estado                      │
│  - Re-renderiza componentes             │
└─────────────────────────────────────────┘
```

### Código do Web Worker

O Web Worker é criado **inline** usando Blob URL em `src/lib/ranking/service.ts`:

```typescript
function runRankingInWorker(
    user: CandidateProfile,
    candidates: CandidateProfile[],
    maxDistance: number = 20000
): Promise<RankingResult> {
    return new Promise((resolve, reject) => {
        // Criar código do worker como string
        const workerCode = `
            // Funções auxiliares
            function calculateDistance(...) { ... }
            function checkProximity(...) { ... }
            function hasCommonSkills(...) { ... }
            function calculateAbsoluteScore(...) { ... }
            
            // Handler de mensagens
            self.onmessage = function(e) {
                const { user, candidates, maxDistance } = e.data;
                try {
                    // Lógica do algoritmo aqui
                    // ...
                    
                    self.postMessage({
                        success: true,
                        result: { ... }
                    });
                } catch (error) {
                    self.postMessage({
                        success: false,
                        error: error.message
                    });
                }
            };
        `;
        
        // Criar Blob e Worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        
        // Handler de resposta
        worker.onmessage = (e) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            
            if (e.data.success) {
                resolve(e.data.result);
            } else {
                reject(new Error(e.data.error));
            }
        };
        
        // Handler de erro
        worker.onerror = (error) => {
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
            reject(error);
        };
        
        // Enviar dados para worker
        worker.postMessage({ user, candidates, maxDistance });
    });
}
```

## Por que Inline Worker?

### Abordagem: Blob URL

Ao invés de criar um arquivo `.worker.js` separado, o código do worker é definido como string e executado via Blob URL.

### Vantagens

1. **Simplicidade**: Não requer arquivo separado
2. **Deploy**: Todo código em um lugar
3. **Manutenção**: Mais fácil de manter e debugar
4. **Build**: Não requer configuração especial de bundler

### Desvantagens

1. **Tamanho**: Código duplicado (se houver funções compartilhadas)
2. **TypeScript**: Não há type checking no código do worker
3. **Debug**: Mais difícil de debugar (código como string)

## Limitações dos Web Workers

### O que Workers NÃO Podem Acessar

- ❌ DOM
- ❌ `window` object
- ❌ `document` object
- ❌ Funções globais da main thread
- ❌ Estado compartilhado direto

### O que Workers PODEM Fazer

- ✅ Cálculos matemáticos
- ✅ Operações em arrays
- ✅ Processamento de dados
- ✅ Comunicação via `postMessage()`

### Comunicação: postMessage()

A comunicação entre main thread e worker é **assíncrona** e usa mensagens:

```typescript
// Main thread → Worker
worker.postMessage({ user, candidates, maxDistance });

// Worker → Main thread
self.postMessage({ success: true, result: ... });
```

**Importante**: Dados são **copiados** (structured cloning), não compartilhados. Para dados grandes, considere `Transferable Objects`.

## Funções no Worker

### 1. calculateDistance()

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distância em metros
}
```

### 2. checkProximity()

```javascript
function checkProximity(userLocation, candidateLocation, maxDistance) {
    if (!userLocation) return true;
    if (!candidateLocation) return false;
    
    const distance = calculateDistance(
        userLocation.latitude, userLocation.longitude,
        candidateLocation.latitude, candidateLocation.longitude
    );
    
    return distance <= maxDistance;
}
```

### 3. hasCommonSkills()

```javascript
function hasCommonSkills(user, candidate) {
    const userSkills = user.skills || [];
    const candidateSkills = candidate.skills || [];
    
    if (userSkills.length === 0 || candidateSkills.length === 0) {
        return false;
    }
    
    return userSkills.some(skill => candidateSkills.includes(skill));
}
```

### 4. calculateAbsoluteScore()

```javascript
function calculateAbsoluteScore(profile) {
    let score = 0;
    const courses = profile.courses || [];
    const skills = profile.skills || [];
    const diffSkills = profile.profile_analysis || [];
    
    const courseScore = Math.min(courses.length * 10, 60);
    const skillScore = Math.min(skills.length * 3, 30);
    
    score = courseScore + skillScore;
    
    const diffMultiplier = diffSkills.length > 0 
        ? 1 + (diffSkills.length * 0.05) 
        : 1.0;
    
    score *= diffMultiplier;
    score += diffSkills.length * 1;
    
    return Math.min(score, 100);
}
```

## Cleanup e Gerenciamento de Recursos

### Importante: Limpar Workers

```typescript
worker.onmessage = (e) => {
    // Terminar worker após uso
    worker.terminate();
    
    // Revogar Blob URL para liberar memória
    URL.revokeObjectURL(workerUrl);
    
    // Processar resultado
    resolve(e.data.result);
};
```

**Por que isso é importante?**
- Workers consomem recursos do sistema
- Blob URLs ocupam memória
- Múltiplos workers podem causar problemas de performance

## Performance

### Métricas Típicas

| Operação | Tempo (Main Thread) | Tempo (Worker) | Ganho |
|----------|---------------------|----------------|-------|
| 50 candidatos | 50ms | 50ms | UI responsiva |
| 100 candidatos | 150ms | 150ms | UI responsiva |
| 200 candidatos | 300ms | 300ms | UI responsiva |

**Nota**: O tempo de processamento é o mesmo, mas na main thread a UI congela, enquanto no worker a UI permanece responsiva.

### Overhead de Comunicação

- **Serialização**: ~1-5ms para dados típicos
- **Deserialização**: ~1-5ms no worker
- **Total overhead**: ~2-10ms (negligível comparado ao processamento)

## Alternativas Consideradas

### 1. setTimeout() / requestIdleCallback()

❌ **Rejeitado**: Não verdadeiramente paralelo, apenas adia execução

### 2. Service Workers

❌ **Rejeitado**: Mais complexo, projetado para cache e offline

### 3. Web Assembly (WASM)

⚠️ **Futuro**: Pode ser considerado para cálculos mais intensivos

### 4. SharedArrayBuffer

⚠️ **Futuro**: Permite memória compartilhada, mas requer headers de segurança específicos

## Debugging Web Workers

### Chrome DevTools

1. Abrir DevTools (F12)
2. Ir para aba "Sources"
3. Procurar por "workers" no painel esquerdo
4. Colocar breakpoints no código do worker

### Console Logs

```javascript
// No worker
self.onmessage = function(e) {
    console.log('Worker received:', e.data);
    // ... processamento
    console.log('Worker sending:', result);
    self.postMessage({ success: true, result });
};
```

**Nota**: Logs do worker aparecem no console, mas podem ser difíceis de distinguir da main thread.

## Melhorias Futuras

### 1. Worker Pool

Criar pool de workers reutilizáveis para evitar criação/destruição constante:

```typescript
class WorkerPool {
    private workers: Worker[] = [];
    
    getWorker(): Worker { ... }
    releaseWorker(worker: Worker): void { ... }
}
```

### 2. Transferable Objects

Para dados grandes, usar Transferable Objects ao invés de structured cloning:

```typescript
worker.postMessage(largeArray, [largeArray.buffer]);
```

### 3. Worker Modular

Separar código do worker em módulos reutilizáveis:

```typescript
// worker/ranking.ts
export function calculateAbsoluteScore(...) { ... }

// worker/index.ts
import { calculateAbsoluteScore } from './ranking';
```

### 4. Progress Updates

Enviar atualizações de progresso durante processamento:

```typescript
self.postMessage({ 
    type: 'progress', 
    progress: 0.5 
});
```

