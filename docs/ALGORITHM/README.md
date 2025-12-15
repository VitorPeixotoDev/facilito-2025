# Guia Técnico do Algoritmo de Ranking

## Visão Geral

Este documento fornece uma documentação técnica completa do sistema de ranking de candidatos implementado na aplicação. O algoritmo foi projetado para comparar e ranquear perfis de usuários baseado em múltiplos critérios, priorizando similaridade, qualidade do perfil e proximidade geográfica.

## Índice

1. [Arquitetura do Sistema](./ARCHITECTURE.md) - Visão geral da arquitetura e componentes
2. [Lógica do Algoritmo](./ALGORITHM_LOGIC.md) - Explicação detalhada da lógica de ranking
3. [Fluxo de Dados](./DATA_FLOW.md) - Como os dados fluem através do sistema
4. [Sistema de Pontuação](./SCORING_SYSTEM.md) - Detalhes sobre como os scores são calculados
5. [Processamento Paralelo](./WEB_WORKERS.md) - Uso de Web Workers para performance
6. [Estrutura de Dados](./DATA_STRUCTURES.md) - Interfaces e tipos TypeScript
7. [Referência de API](./API_REFERENCE.md) - Documentação completa das funções
8. [Exemplos Práticos](./EXAMPLES.md) - Casos de uso e exemplos de código

## Conceitos Principais

### Ranking Competitivo

O sistema implementa um ranking competitivo onde:
- **Todos os candidatos** (incluindo o usuário em sessão) são avaliados usando a mesma métrica
- Os candidatos são **ordenados por score absoluto** baseado em seus próprios perfis
- A posição no ranking reflete a **competição real** entre todos os participantes

### Filtragem em Camadas

O algoritmo aplica filtros progressivos:

1. **Filtro de Habilidades Comuns**: Apenas candidatos com pelo menos uma habilidade em comum com o usuário
2. **Filtro Geográfico**: Apenas candidatos dentro de 20km do usuário (se o usuário tem localização)
3. **Cálculo de Score**: Todos os candidatos filtrados são pontuados de forma absoluta
4. **Ordenação e Ranking**: Candidatos são ordenados e recebem posições sequenciais

### Pontuação Absoluta

O sistema usa **pontuação absoluta** ao invés de pontuação relativa de similaridade:
- Cada candidato recebe um score baseado **apenas em seu próprio perfil**
- O score não depende de comparação com outros candidatos
- Isso garante uma competição justa onde todos competem sob as mesmas regras

## Estrutura de Arquivos

```
src/lib/ranking/
├── service.ts           # Camada de serviço (fetching e Web Workers)
├── types.ts             # Interfaces e tipos TypeScript
├── algorithm.ts         # Implementação do algoritmo (legacy, não usado atualmente)
├── rankingWorker.ts     # Web Worker standalone (legacy, código inline usado)
├── calculators/         # Funções de cálculo de similaridade (futuro)
│   └── index.ts
└── utils/               # Utilitários
    ├── distance.ts      # Cálculo de distância geográfica
    └── similarity.ts    # Funções de similaridade (futuro)
```

## Tecnologias Utilizadas

- **TypeScript**: Tipagem estática
- **Web Workers**: Processamento paralelo
- **Supabase**: Banco de dados e autenticação
- **Haversine Formula**: Cálculo de distância geográfica

## Requisitos do Sistema

### Banco de Dados

- Tabela `users` com as seguintes colunas relevantes:
  - `id` (UUID)
  - `full_name` (string)
  - `skills` (text[])
  - `courses` (text[])
  - `freelancer_services` (text[])
  - `home_address` (jsonb com `latitude`, `longitude`, `description`)
  - `profile_analysis` (text[]) - habilidades diferenciais

### Políticas RLS (Row Level Security)

⚠️ **IMPORTANTE**: Para o ranking funcionar, é necessário ter uma política RLS que permita usuários autenticados visualizarem dados públicos de outros usuários:

```sql
CREATE POLICY "Authenticated users can view public profile data for ranking" 
ON public.users FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);
```

Veja o arquivo `docs/SQL/fix_rls_for_ranking.sql` para o script completo.

## Performance

- **Processamento Paralelo**: Cálculos pesados rodam em Web Worker
- **Limite de Candidatos**: Máximo de 200 candidatos buscados do banco (configurável)
- **Top 20**: Apenas os 20 primeiros candidatos são retornados para a UI

## Status de Implementação

✅ **Implementado e Ativo**:
- Filtragem por habilidades comuns
- Filtragem geográfica (20km)
- Cálculo de score absoluto
- Ranking competitivo
- Processamento paralelo com Web Workers

🚧 **Planejado para Futuro**:
- Hierarquia de categorias para skills
- Cálculo de similaridade avançado
- Sistema de pesos configurável
- Análise de experiência profissional
- Score breakdown detalhado

## Contato e Contribuições

Para questões técnicas ou melhorias, consulte a documentação específica de cada componente.

