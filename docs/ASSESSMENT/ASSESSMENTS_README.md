# Sistema de Avaliações - Guia Rápido

## Instalação

1. Execute o script SQL em `docs/sql/assessments_tables.sql` no Supabase
2. Configure as políticas RLS conforme necessário
3. O sistema está pronto para uso!

## Estrutura de Arquivos

```
src/
├── lib/
│   └── assessments/
│       ├── assessmentService.ts    # Serviço de banco de dados
│       ├── resultsStorage.ts       # Camada de abstração (DB + localStorage)
│       ├── assessmentsConfig.ts     # Configuração das avaliações
│       └── index.ts                 # Exportações
├── components/
│   └── assessments/
│       ├── AssessmentsList.tsx     # Lista de avaliações
│       ├── AssessmentCard.tsx      # Card de avaliação
│       ├── FiveMindInstructions.tsx
│       ├── FiveMindQuestionnaire.tsx
│       └── FiveMindResults.tsx
└── app/
    └── candidato/
        └── marketing/
            └── avaliacoes/
                └── [id]/
                    ├── page.tsx
                    └── AssessmentContent.tsx
```

## Como Funciona

1. **Usuário inicia avaliação** → Navega para `/candidato/marketing/avaliacoes/[id]`
2. **Completa questionário** → Resultados são salvos no banco
3. **Trigger atualiza** → `users.analise_perfil` é atualizado automaticamente
4. **Resultados exibidos** → Usuário vê seus resultados

## Documentação Completa

Veja `docs/ASSESSMENTS_DATABASE.md` para documentação detalhada.

