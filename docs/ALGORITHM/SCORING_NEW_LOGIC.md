# Nova Lógica de Pontuação do Ranking

## Visão Geral

A nova lógica de pontuação implementa um sistema mais justo e preciso para rankear candidatos, com as seguintes características principais:

1. **Multiplicador fixo para testes** (1.05, configurável)
2. **Habilidades valorizadas mais que cursos** com pesos decrescentes
3. **Cursos com peso por nível educacional** (técnico a doutorado)
4. **Score máximo de 99.9** com curva logarítmica (dificuldade crescente)
5. **Substituição completa de testes** (não acúmulo)

---

## 1. Multiplicador Fixo para Testes

### Configuração

- **Valor padrão**: 1.05 (5% de aumento)
- **Configurável**: Pode ser alterado por teste/parceiro no futuro

### Implementação Futura

Para testes premium de parceiros qualificados, o multiplicador pode ser aumentado:
- Teste padrão: 1.05
- Teste premium de parceiro: 1.12 (exemplo)

### Localização

- Arquivo: `src/lib/ranking/utils/assessmentConfig.ts`
- Configuração: `DEFAULT_ASSESSMENT_MULTIPLIERS`

### Comportamento

- Cada teste aplica um multiplicador **fixo**, não baseado na quantidade
- Não há acúmulo: fazer múltiplos testes não aumenta a pontuação
- O multiplicador é aplicado ao score bruto (cursos + habilidades)

---

## 2. Habilidades com Peso Decrescente

### Lógica

- **Categorias principais**: Recebem peso completo (100%)
- **Subcategorias**: Recebem peso decrescente

### Cálculo

1. Primeira habilidade (categoria principal): **10 pontos** (peso 1.0)
2. Habilidades subsequentes: Peso decrescente
   - 2ª habilidade: peso 0.85 (8.5 pontos)
   - 3ª habilidade: peso 0.70 (7.0 pontos)
   - 4ª habilidade: peso 0.55 (5.5 pontos)
   - 5ª habilidade: peso 0.40 (4.0 pontos)
   - ... (mínimo: peso 0.3)

### Exemplo

Candidato com habilidades de vendas:
- "Vendedor" (principal): 10 pontos
- "Técnicas de Vendas": 8.5 pontos
- "Vendas Atacado": 7.0 pontos
- "Vendas a Consumidor Final": 5.5 pontos
- **Total**: 31 pontos (não há limite)

### Importante

- **Não há limite máximo** para habilidades
- Skills são **mais valorizadas** que cursos
- Categorias principais são identificadas automaticamente

### Localização

- Arquivo: `src/lib/ranking/utils/skillCategoryAnalyzer.ts`

---

## 3. Cursos com Peso por Nível

### Níveis e Pontos

| Nível | Pontos | Exemplos |
|-------|--------|----------|
| **Técnico** | 5 pts | "Técnico em Administração", "Curso Técnico" |
| **Graduação** | 10 pts | "Graduação em Engenharia", "Bacharelado", "Licenciatura" |
| **Especialização** | 15 pts | "Especialização em Marketing", "Pós-Graduação Lato Sensu" |
| **Mestrado** | 18 pts | "Mestrado em Administração", "Master" |
| **Doutorado** | 20 pts | "Doutorado", "PhD", "Pós-Doutorado" |

### Cálculo

- Cada curso recebe pontos baseado em seu nível
- Não há limite máximo de pontos de cursos
- Total = Soma de pontos de todos os cursos

### Identificação

O sistema identifica o nível através de:
1. **Categoria** (se disponível): Mapeamento direto
2. **Palavras-chave** no nome do curso: Busca por termos específicos

### Localização

- Arquivo: `src/lib/ranking/utils/courseLevelMapper.ts`

---

## 4. Score Máximo 99.9 com Curva Logarítmica

### Fórmula

```
score = 99.9 * (1 - e^(-k * normalizedRaw))
```

Onde:
- `k = 0.03` (parâmetro de curva)
- `normalizedRaw` = score bruto / score máximo estimado

### Comportamento da Curva

| Faixa de Pontos | Dificuldade | Progressão |
|-----------------|-------------|------------|
| 0-50 | Fácil | Quase linear |
| 50-80 | Moderada | Progressão reduzida |
| 80-95 | Difícil | Progressão muito reduzida |
| 95-99.9 | Muito difícil | Incrementos mínimos |

### Características

- **Nunca ultrapassa 99.9**
- Quanto mais próximo do máximo, mais difícil ganhar cada ponto
- Score de 99.9 é raro e significativo

### Localização

- Arquivo: `src/lib/ranking/utils/scoreNormalizer.ts`

---

## 5. Substituição Completa de Testes

### Comportamento Anterior

- Triggers SQL mesclavam testes: FiveMind + HexaMind juntos
- Isso causava acúmulo de vantagem

### Novo Comportamento

- Cada novo teste **substitui completamente** todos os anteriores
- Não há mesclagem: apenas o último teste realizado fica no `profile_analysis`
- Evita acúmulo de multiplicadores

### Implementação

- Triggers SQL foram modificados para **não mesclar**
- `existing_analise_perfil` não é mais usado
- Apenas `new_analise_perfil` é salvo

### Localização

- Arquivo: `docs/SQL/migrate_add_assessment_prefixes.sql`

---

## Fluxo de Cálculo Completo

### Passo 1: Calcular Score Bruto

```typescript
rawScore = courseScore + skillScore
```

Onde:
- `courseScore` = Soma de pontos por nível dos cursos
- `skillScore` = Soma de habilidades com pesos decrescentes

### Passo 2: Aplicar Multiplicador de Teste

```typescript
multipliedScore = rawScore * assessmentMultiplier
```

Onde:
- `assessmentMultiplier` = 1.05 (fixo, não baseado em quantidade)

### Passo 3: Normalizar para 0-99.9

```typescript
finalScore = normalizeScore(multipliedScore, maxRawScore)
```

Onde:
- `normalizeScore` usa curva logarítmica
- `maxRawScore` = 200 (estimativa)

---

## Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Testes** | Multiplicador baseado em quantidade (1 + n*0.05) | Multiplicador fixo (1.05) |
| **Habilidades** | Máximo 30 pontos, peso fixo (3 pts/habilidade) | Sem limite, peso decrescente (10 pts primeira, depois reduz) |
| **Cursos** | Máximo 60 pontos, peso fixo (10 pts/curso) | Sem limite, peso por nível (5-20 pts) |
| **Score Máximo** | 100 (fácil de alcançar) | 99.9 (curva logarítmica, difícil) |
| **Testes Múltiplos** | Acúmulo (FiveMind + HexaMind juntos) | Substituição (apenas último teste) |

---

## Configuração Futura

### Multiplicadores de Teste

Para adicionar novos testes com multiplicadores diferentes:

```typescript
// src/lib/ranking/utils/assessmentConfig.ts
export const DEFAULT_ASSESSMENT_MULTIPLIERS: AssessmentMultiplierConfig = {
    'five-mind': 1.05,
    'hexa-mind': 1.05,
    'premium-partner-test': 1.12, // Novo teste premium
};
```

### Ajuste da Curva Logarítmica

Para tornar mais difícil alcançar 99.9:
- Aumentar `k` em `normalizeScore` (ex: 0.03 → 0.04)

Para tornar mais fácil:
- Diminuir `k` (ex: 0.03 → 0.02)

---

## Documentação Técnica

### Arquivos Criados

1. `src/lib/ranking/utils/assessmentConfig.ts` - Configuração de multiplicadores
2. `src/lib/ranking/utils/courseLevelMapper.ts` - Mapeamento de níveis de cursos
3. `src/lib/ranking/utils/skillCategoryAnalyzer.ts` - Análise de categorias de habilidades
4. `src/lib/ranking/utils/scoreNormalizer.ts` - Normalização com curva logarítmica
5. `src/lib/ranking/utils/scoreCalculator.ts` - Cálculo centralizado de scores

### Arquivos Modificados

1. `src/lib/ranking/service.ts` - Worker atualizado com nova lógica
2. `docs/SQL/migrate_add_assessment_prefixes.sql` - Triggers modificados para substituição completa

---

## Testes Recomendados

1. **Teste de multiplicador fixo**: Verificar que fazer múltiplos testes não aumenta o score
2. **Teste de habilidades**: Verificar que primeira habilidade recebe mais peso
3. **Teste de cursos**: Verificar que doutorado recebe mais pontos que técnico
4. **Teste de normalização**: Verificar que score nunca ultrapassa 99.9
5. **Teste de substituição**: Verificar que novo teste substitui anterior

---

## Observações Importantes

⚠️ **Migração SQL Necessária**: Execute `docs/SQL/migrate_add_assessment_prefixes.sql` para aplicar as mudanças nos triggers.

⚠️ **Dados Existentes**: Testes já salvos continuarão funcionando, mas novos testes usarão a lógica de substituição completa.

⚠️ **Configuração**: Multiplicadores podem ser ajustados em `assessmentConfig.ts` sem modificar o código principal.


