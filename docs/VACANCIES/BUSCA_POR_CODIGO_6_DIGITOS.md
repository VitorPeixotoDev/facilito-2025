# Busca de vagas por código de 6 dígitos

## Visão geral

Funcionalidade **mobile-first** que permite buscar vagas pelo **código de localização do recrutador** (6 dígitos). É uma **busca à parte** da busca por texto: o usuário alterna entre os dois modos pela interface.

## Comportamento na interface (mobile)

1. **Campo de busca padrão (modo texto)**  
   - Um único campo de texto para "Buscar vagas, empresas ou requisitos...".  
   - **Botão com ícone de teclado** (remete ao teclado do celular) dentro do field de busca.  
   - Ao clicar nesse botão, o campo de busca por texto é **substituído** por seis campos individuais para os dígitos do código.

2. **Modo código (6 dígitos)**  
   - Seis inputs numéricos lado a lado (`inputMode="numeric"`, `pattern="[0-9]*"` para abrir teclado numérico no mobile).  
   - Preenchimento sequencial: ao digitar um dígito, o foco avança para o próximo; em Backspace com campo vazio, o foco volta ao anterior.  
   - **Botão de reversão** (ícone seta/voltar): ao clicar, o usuário **volta** ao campo de busca por texto e o código é limpo.

3. **Resultado**  
   - Quando os 6 dígitos estão preenchidos, a aplicação busca vagas pelo código (server action).  
   - A lista exibida é apenas a da busca por código; filtros por aba (Vagas/Candidaturas) e tipo de trabalho continuam aplicados.  
   - Estado vazio específico: "Nenhuma vaga para este código" quando não há resultados.

## Integração com a busca atual

- **Busca por texto** e **busca por código** são **separadas**: não há mistura de critérios.  
- Só um modo está ativo por vez (texto ou código), controlado pelo estado `searchMode` e pela troca via botão teclado / botão reverter.

## Arquivos principais

| Arquivo | Responsabilidade |
|--------|-------------------|
| `VagasHeader.tsx` | UI: modo texto (campo + botão teclado) vs. modo código (6 inputs + botão reverter). |
| `VagasPageClient.tsx` | Estado `searchMode`, `codeDigits`, `locationCodeJobs`; chama `getJobsByLocationCode` quando há 6 dígitos. |
| `actions.ts` | Server action `getJobsByLocationCode(code)` que retorna `{ jobs: JobDisplay[] }`. |
| `serverVacancyService.ts` | `fetchJobsByLocationCode(code)`: consulta `recruiter_location_codes` e filtra `jobs` por `recruiter_location_code_id`. |
| `VagasEmptyState.tsx` | Mensagem específica quando a busca por código não retorna resultados (`isCodeSearch`). |

## Banco de dados

- **Tabela** `recruiter_location_codes` (já existente): a coluna do código de 6 dígitos é **`code_6_digits`** (não `code`).  
- **Tabela** `jobs`: coluna opcional `recruiter_location_code_id` (FK para `recruiter_location_codes`).  

Script SQL: `docs/SQL/add_recruiter_location_codes.sql` — não cria a tabela `recruiter_location_codes`; apenas adiciona `recruiter_location_code_id` em `jobs` e configura RLS.  
Sem a coluna `recruiter_location_code_id` em `jobs`, a busca por código retorna lista vazia e a UI continua funcional.

## Fluxo técnico (busca por código)

1. Usuário preenche o 6º dígito.  
2. `VagasPageClient` detecta `codeDigits` com 6 caracteres e chama `getJobsByLocationCode(code)`.  
3. Server action chama `fetchJobsByLocationCode(code)`:  
   - Consulta `recruiter_location_codes` por **`code_6_digits`**;  
   - Busca `jobs` com `recruiter_location_code_id = id` e `status = 'recebendo_candidatos'`;  
   - Retorna lista em formato `JobDisplay[]`.  
4. Cliente armazena o resultado em `locationCodeJobs` e exibe na lista (respeitando tab e filtro de tipo de trabalho).

## Acessibilidade e mobile

- Botão teclado: `aria-label="Buscar por código de 6 dígitos"`.  
- Botão reverter: `aria-label="Voltar para busca por texto"`.  
- Cada input do código: `aria-label="Dígito N do código"`.  
- Uso de `inputMode="numeric"` e `pattern="[0-9]*"` para favorecer teclado numérico em dispositivos móveis.  
- Áreas de toque adequadas (`touch-manipulation`, tamanho dos botões e dos 6 campos) para uso em mobile.
