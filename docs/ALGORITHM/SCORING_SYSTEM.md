# Sistema de Pontuação

## Visão Geral

O sistema de pontuação usa uma abordagem **absoluta** baseada no próprio perfil do candidato, não em comparação relativa com outros. Isso garante uma competição justa onde todos são avaliados pelos mesmos critérios.

## Componentes do Score

O score final é calculado através da seguinte fórmula:

```
finalScore = min((courseScore + skillScore) × diffMultiplier + diffBonus, 100)
```

Onde:
- `courseScore`: Pontos de cursos (0-60)
- `skillScore`: Pontos de habilidades (0-30)
- `diffMultiplier`: Multiplicador de habilidades diferenciais (1.0+)
- `diffBonus`: Bônus de habilidades diferenciais
- Score máximo: 100

## 1. Pontuação de Cursos

### Fórmula

```javascript
courseScore = min(courses.length × 10, 60)
```

### Detalhes

- **10 pontos por curso**
- **Máximo de 60 pontos** (6 cursos ou mais = 60 pontos)
- Funciona como um "teto" para evitar que cursos dominem completamente o score

### Exemplos

| Quantidade de Cursos | Cálculo | Score |
|----------------------|---------|-------|
| 0                    | 0 × 10  | 0     |
| 1                    | 1 × 10  | 10    |
| 3                    | 3 × 10  | 30    |
| 5                    | 5 × 10  | 50    |
| 6                    | 6 × 10  | 60    |
| 10                   | min(100, 60) | 60    |

### Justificativa

- **60% do peso máximo**: Cursos têm o maior peso no algoritmo
- **Diminishing returns**: Após 6 cursos, não há mais ganho de pontos
- Incentiva diversificação: ter mais cursos é melhor até certo ponto

## 2. Pontuação de Habilidades

### Fórmula

```javascript
skillScore = min(skills.length × 3, 30)
```

### Detalhes

- **3 pontos por habilidade**
- **Máximo de 30 pontos** (10 habilidades ou mais = 30 pontos)
- Funciona como um "teto" similar aos cursos

### Exemplos

| Quantidade de Habilidades | Cálculo | Score |
|---------------------------|---------|-------|
| 0                         | 0 × 3   | 0     |
| 1                         | 1 × 3   | 3     |
| 5                         | 5 × 3   | 15    |
| 10                        | 10 × 3  | 30    |
| 15                        | min(45, 30) | 30    |

### Justificativa

- **30% do peso máximo**: Habilidades têm peso médio
- **Critério de agrupamento**: Habilidades são usadas para filtrar candidatos similares
- Incentiva especialização: ter habilidades relevantes é importante

## 3. Multiplicador de Habilidades Diferenciais

### Fórmula

```javascript
diffMultiplier = diffSkills.length > 0 
    ? 1 + (diffSkills.length × 0.05)
    : 1.0
```

### Detalhes

- **Base**: 1.0 (sem multiplicador se não houver habilidades diferenciais)
- **Incremento**: +0.05 por habilidade diferencial
- **Máximo teórico**: 1.0 + (n × 0.05), onde n = quantidade de habilidades diferenciais

### Exemplos

| Quantidade de Habilidades Diferenciais | Multiplicador | Aumento |
|----------------------------------------|---------------|---------|
| 0                                      | 1.0           | 0%      |
| 1                                      | 1.05          | 5%      |
| 2                                      | 1.10          | 10%     |
| 3                                      | 1.15          | 15%     |
| 5                                      | 1.25          | 25%     |
| 10                                     | 1.50          | 50%     |

### Aplicação

O multiplicador é aplicado ao score base (cursos + habilidades):

```javascript
scoreBase = courseScore + skillScore
scoreComMultiplicador = scoreBase × diffMultiplier
```

**Exemplo**:
- Score base: 70 (60 de cursos + 10 de habilidades)
- Habilidades diferenciais: 3
- Multiplicador: 1.15
- Score após multiplicador: 70 × 1.15 = 80.5

### Justificativa

- **Bônus progressivo**: Recompensa candidatos com habilidades diferenciais
- **Não dominante**: Multiplicador é modesto para não dominar o score
- **Diferencial competitivo**: Habilidades diferenciais são o "desempate"

## 4. Bônus de Habilidades Diferenciais

### Fórmula

```javascript
diffBonus = diffSkills.length × 1
```

### Detalhes

- **1 ponto adicional por habilidade diferencial**
- Aplicado **depois** do multiplicador
- Aditivo, não multiplicativo

### Exemplos

| Quantidade de Habilidades Diferenciais | Bônus |
|----------------------------------------|-------|
| 0                                      | 0     |
| 1                                      | 1     |
| 3                                      | 3     |
| 5                                      | 5     |

### Aplicação

```javascript
scoreFinal = (scoreBase × diffMultiplier) + diffBonus
```

**Exemplo Completo**:
- Score base: 70
- Habilidades diferenciais: 3
- Multiplicador: 1.15
- Score após multiplicador: 70 × 1.15 = 80.5
- Bônus: 3
- Score final: 80.5 + 3 = 83.5

## 5. Limite Máximo (Cap)

### Fórmula

```javascript
finalScore = min(scoreCalculado, 100)
```

### Detalhes

- **Score máximo**: 100
- Qualquer cálculo acima de 100 é limitado a 100
- Garante que scores permaneçam na faixa 0-100

### Quando o Cap é Atingido?

Com o sistema atual, é difícil atingir 100 sem habilidades diferenciais, mas possível com muitas habilidades diferenciais.

**Exemplo**:
- Cursos: 6+ (60 pontos)
- Habilidades: 10+ (30 pontos)
- Score base: 90
- Habilidades diferenciais: 5
- Multiplicador: 1.25
- Score após multiplicador: 90 × 1.25 = 112.5
- Bônus: 5
- Score antes do cap: 117.5
- **Score final**: min(117.5, 100) = 100

## Exemplos Completos de Cálculo

### Exemplo 1: Perfil Básico

**Dados**:
- Cursos: 2
- Habilidades: 5
- Habilidades diferenciais: 0

**Cálculo**:
```
courseScore = min(2 × 10, 60) = 20
skillScore = min(5 × 3, 30) = 15
scoreBase = 20 + 15 = 35
diffMultiplier = 1.0 (sem habilidades diferenciais)
scoreComMultiplicador = 35 × 1.0 = 35
diffBonus = 0
finalScore = min(35, 100) = 35
```

**Resultado**: 35 pontos

### Exemplo 2: Perfil Intermediário

**Dados**:
- Cursos: 4
- Habilidades: 8
- Habilidades diferenciais: 2

**Cálculo**:
```
courseScore = min(4 × 10, 60) = 40
skillScore = min(8 × 3, 30) = 24
scoreBase = 40 + 24 = 64
diffMultiplier = 1 + (2 × 0.05) = 1.10
scoreComMultiplicador = 64 × 1.10 = 70.4
diffBonus = 2 × 1 = 2
finalScore = min(72.4, 100) = 72.4
```

**Resultado**: 72.4 pontos

### Exemplo 3: Perfil Avançado

**Dados**:
- Cursos: 6
- Habilidades: 12
- Habilidades diferenciais: 4

**Cálculo**:
```
courseScore = min(6 × 10, 60) = 60
skillScore = min(12 × 3, 30) = 30 (limitado)
scoreBase = 60 + 30 = 90
diffMultiplier = 1 + (4 × 0.05) = 1.20
scoreComMultiplicador = 90 × 1.20 = 108
diffBonus = 4 × 1 = 4
scoreAntesDoCap = 108 + 4 = 112
finalScore = min(112, 100) = 100
```

**Resultado**: 100 pontos (cap atingido)

## Distribuição de Pesos

| Componente | Peso Máximo | Percentual |
|------------|-------------|------------|
| Cursos     | 60          | 60%        |
| Habilidades | 30         | 30%        |
| Habilidades Diferenciais | 10 (estimado) | 10% |

**Total**: ~100 pontos (pode ultrapassar com muitas habilidades diferenciais, mas é limitado a 100)

## Tabela de Referência Rápida

### Score Base (sem habilidades diferenciais)

| Cursos | Habilidades | Score Base |
|--------|-------------|------------|
| 0      | 0           | 0          |
| 1      | 1           | 13         |
| 2      | 3           | 29         |
| 3      | 5           | 45         |
| 4      | 7           | 61         |
| 5      | 9           | 77         |
| 6+     | 10+         | 90         |

### Impacto de Habilidades Diferenciais

Para um score base de 90:

| Dif. Skills | Multiplicador | Score Após Mult. | Bônus | Score Final |
|-------------|---------------|------------------|-------|-------------|
| 0           | 1.00          | 90.0             | 0     | 90.0        |
| 1           | 1.05          | 94.5             | 1     | 95.5        |
| 2           | 1.10          | 99.0             | 2     | 101.0 → 100 |
| 3           | 1.15          | 103.5            | 3     | 106.5 → 100 |
| 5           | 1.25          | 112.5            | 5     | 117.5 → 100 |

## Considerações de Design

### Por que Pontuação Absoluta?

1. **Justiça**: Todos competem sob as mesmas regras
2. **Transparência**: Fácil de explicar aos usuários
3. **Motivação**: Usuários sabem exatamente o que melhorar
4. **Simplicidade**: Não requer comparação complexa

### Por que Cursos Têm Maior Peso?

1. **Educação formal**: Cursos representam investimento em educação
2. **Diferenciação**: Mais cursos indicam maior dedicação
3. **Valor percebido**: Cursos são valorizados pelos contratantes

### Por que Habilidades Têm Peso Médio?

1. **Critério de agrupamento**: Usadas para filtrar candidatos similares
2. **Especialização**: Importante mas não dominante
3. **Balanceamento**: Equilibra com cursos

### Por que Habilidades Diferenciais São Multiplicador?

1. **Diferenciação**: Realmente diferenciam candidatos
2. **Desempate**: Úteis quando scores são iguais
3. **Bônus moderado**: Não dominam completamente o score

## Possíveis Ajustes Futuros

1. **Pesos Configuráveis**: Permitir ajuste de pesos por configuração
2. **Normalização Dinâmica**: Ajustar pesos baseado na distribuição de dados
3. **Categorias de Cursos**: Diferentes pesos para diferentes tipos de cursos
4. **Relevância de Habilidades**: Peso diferente baseado na relevância da habilidade
5. **Experiência Profissional**: Adicionar componente de anos de experiência

