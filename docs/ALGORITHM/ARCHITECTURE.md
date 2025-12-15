# Arquitetura do Sistema de Ranking

## Visão Geral da Arquitetura

O sistema de ranking foi projetado com uma arquitetura em camadas que separa responsabilidades e permite processamento paralelo para manter a UI responsiva.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Camada de Apresentação                    │
│  (React Components: UserRanking, CandidateRankingList)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Camada de Aplicação                       │
│              (src/app/applicant/page.tsx)                    │
│  - Gerencia estado do ranking                               │
│  - Chama fetchAndRankCandidates()                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Camada de Serviço                         │
│              (src/lib/ranking/service.ts)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  fetchUserProfile()                                  │  │
│  │  - Busca perfil do usuário do banco                 │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  fetchCandidatesFromDatabase()                       │  │
│  │  - Busca candidatos do banco (limit: 200)           │  │
│  └──────────────────────┬───────────────────────────────┘  │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  runRankingInWorker()                                │  │
│  │  - Cria Web Worker                                   │  │
│  │  - Envia dados para processamento paralelo          │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Web Worker (Thread Paralelo)                    │
│          (Código inline em service.ts)                       │
│                                                              │
│  1. Filtragem de Candidatos                                 │
│     ├─ Filtrar por habilidades comuns                       │
│     └─ Filtrar por proximidade (20km)                       │
│                                                              │
│  2. Cálculo de Scores                                       │
│     └─ calculateAbsoluteScore() para cada candidato         │
│                                                              │
│  3. Ordenação e Ranking                                     │
│     ├─ Ordenar por score (descendente)                      │
│     ├─ Aplicar tiebreaker (habilidades diferenciais)        │
│     └─ Atribuir ranks sequenciais (1, 2, 3...)             │
│                                                              │
│  4. Preparação de Resultados                                │
│     ├─ Separar usuário dos outros candidatos                │
│     ├─ Obter top 20                                         │
│     └─ Calcular estatísticas                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Retorno de Resultados                     │
│              RankingResult Interface                         │
│  - user: posição e score do usuário                        │
│  - rankedCandidates: top 20 candidatos                      │
│  - stats: estatísticas do processamento                     │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. Camada de Apresentação

**Arquivos**:
- `src/components/applicant/profile/UserRanking.tsx`
- `src/components/applicant/profile/CandidateRankingList.tsx`

**Responsabilidades**:
- Exibir posição do usuário no ranking
- Listar os top 20 candidatos
- Mostrar alertas quando perfil está incompleto
- Exibir estatísticas e scores

### 2. Camada de Aplicação

**Arquivo**: `src/app/applicant/page.tsx`

**Responsabilidades**:
- Gerenciar estado do ranking (`rankingResult`, `loadingRanking`)
- Chamar `fetchAndRankCandidates()` quando necessário
- Passar dados para componentes de apresentação
- Tratar erros e estados de carregamento

### 3. Camada de Serviço

**Arquivo**: `src/lib/ranking/service.ts`

**Funções Principais**:

#### `fetchUserProfile(userId: string)`
- Busca o perfil completo do usuário do banco de dados
- Retorna `CandidateProfile | null`
- Trata erros e dados faltantes

#### `fetchCandidatesFromDatabase(userId: string, limit?: number)`
- Busca todos os candidatos do banco (exceto o usuário)
- Limite padrão: 200 candidatos
- Transforma dados do banco para formato `CandidateProfile`
- Converte `home_address` (JSONB) para `UserLocation`

#### `fetchAndRankCandidates(userId: string, maxDistance?: number)`
- **Função principal** de entrada do sistema
- Orquestra todo o processo de ranking
- Coordena fetching e processamento paralelo
- Retorna `RankingResult | null`

#### `runRankingInWorker(user, candidates, maxDistance)`
- Cria Web Worker dinamicamente (Blob URL)
- Envia dados para processamento paralelo
- Retorna Promise com resultados

### 4. Web Worker (Processamento Paralelo)

**Localização**: Código inline em `runRankingInWorker()` dentro de `service.ts`

**Funções Internas**:

#### `calculateDistance(lat1, lon1, lat2, lon2)`
- Implementa fórmula de Haversine
- Calcula distância em metros entre duas coordenadas
- Precisão: ~0.5% para distâncias < 100km

#### `checkProximity(userLocation, candidateLocation, maxDistance)`
- Verifica se candidato está dentro do raio
- Lógica especial:
  - Se usuário não tem localização: inclui todos os candidatos
  - Se usuário tem localização mas candidato não tem: exclui candidato
  - Caso contrário: calcula distância e compara com `maxDistance`

#### `hasCommonSkills(user, candidate)`
- Verifica se há pelo menos uma habilidade em comum
- Retorna `true` se ambos têm habilidades e há interseção
- Retorna `false` se algum não tem habilidades ou não há interseção

#### `calculateAbsoluteScore(profile)`
- **Função core do algoritmo**
- Calcula score baseado apenas no próprio perfil
- Não faz comparação relativa
- Retorna score de 0-100

#### `calculateSimilarityScore(user, candidate)` (legacy)
- Usado apenas para referência/futuro
- Calcula score de similaridade relativa
- Atualmente não é utilizado no algoritmo ativo

## Fluxo de Dados

### Entrada

1. **Usuário em Sessão**: ID do usuário autenticado
2. **Configurações**:
   - `maxDistance`: 20000 metros (20km) - padrão
   - `limit`: 200 candidatos - padrão

### Processamento

1. **Fetching**: Buscar usuário e candidatos do banco
2. **Filtragem**: Aplicar filtros de habilidades e proximidade
3. **Scoring**: Calcular scores absolutos para todos
4. **Ordenação**: Ordenar por score (descendente)
5. **Ranking**: Atribuir posições sequenciais
6. **Seleção**: Separar usuário e selecionar top 20

### Saída

```typescript
{
  user: {
    candidateId: string;
    candidateName: string;
    finalScore: number;      // 0-100
    rank: number;            // Posição no ranking (1-based)
    isSelf: true;
  },
  rankedCandidates: [        // Máximo 20 candidatos
    {
      candidateId: string;
      candidateName: string;
      finalScore: number;
      rank: number;
      isSelf: false;
    },
    ...
  ],
  userInTop20: boolean;      // Se usuário está nos top 20
  stats: {
    totalCandidates: number;           // Total buscado do banco
    relevantCandidates: number;        // Após filtragem
    withinRadius: number;              // Mesmo que relevantCandidates
  }
}
```

## Decisões de Design

### Por que Web Workers?

- **Não bloqueia UI**: Cálculos pesados rodam em thread separada
- **Melhor UX**: Interface permanece responsiva durante processamento
- **Escalabilidade**: Pode processar muitos candidatos sem impacto visual

### Por que Score Absoluto?

- **Justiça**: Todos competem sob as mesmas regras
- **Transparência**: Score reflete qualidade do próprio perfil
- **Simplicidade**: Mais fácil de entender e explicar aos usuários
- **Competitividade**: Cria sensação real de competição

### Por que Filtragem em Camadas?

- **Eficiência**: Reduz número de candidatos a processar
- **Relevância**: Garante que apenas candidatos similares competem
- **Performance**: Menos cálculos de score

### Por que Inline Web Worker?

- **Simplicidade**: Não requer arquivo separado
- **Deploy**: Todo código em um lugar
- **Manutenção**: Mais fácil de manter e debugar

## Extensibilidade

A arquitetura permite extensões futuras:

1. **Novos Critérios de Score**: Adicionar campos ao `calculateAbsoluteScore()`
2. **Diferentes Filtros**: Adicionar mais camadas de filtragem
3. **Configuração Dinâmica**: Permitir ajuste de pesos e limites
4. **Cache**: Implementar cache de resultados
5. **Otimização Geográfica**: Usar PostGIS para filtragem no banco

## Segurança

- **RLS**: Row Level Security garante que apenas dados públicos sejam acessíveis
- **Validação**: Tipos TypeScript garantem estrutura de dados correta
- **Sanitização**: Conversão de tipos previne erros de runtime

## Monitoramento e Debug

- `console.log` statements em pontos críticos
- Tratamento de erros em todas as camadas
- TypeScript para catch de erros em compile-time

