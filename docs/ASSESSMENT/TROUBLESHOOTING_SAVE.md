# Troubleshooting - Salvamento de Resultados

## Problema: Resultados não estão sendo salvos no banco de dados

### Verificações Iniciais

1. **Verificar se as tabelas existem no banco de dados**
   ```sql
   -- Verificar se as tabelas existem
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('five_mind_results', 'hexa_mind_results', 'assessment_results');
   ```

2. **Verificar se o SQL foi executado**
   - Execute o arquivo `docs/SQL/create_assessment_tables.sql` no Supabase SQL Editor
   - Verifique se não há erros na execução

3. **Verificar políticas RLS**
   ```sql
   -- Verificar se RLS está habilitado
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('five_mind_results', 'hexa_mind_results');
   
   -- Verificar políticas
   SELECT * FROM pg_policies 
   WHERE tablename IN ('five_mind_results', 'hexa_mind_results');
   ```

### Debug no Console do Navegador

Ao completar uma avaliação, você deve ver estes logs no console:

#### Logs Esperados (Sucesso)
```
🔄 [AssessmentContent] handleComplete chamado
📊 Resultado recebido: {...}
👤 User ID: <uuid>
💾 [AssessmentContent] Iniciando salvamento...
📦 saveResults chamado: {userId: '<uuid>', assessmentId: 'five-mind'}
🔐 Usuário autenticado, salvando no banco de dados...
📊 saveAssessmentResult - Iniciando salvamento: {...}
📝 Inserindo em assessment_results...
✅ Resultado salvo em assessment_results: {...}
🧠 Verificando se é FiveMind...
📋 Result.results: {...}
🔍 Tem "openness"? true
🧠 Detectado FiveMind, salvando em five_mind_results...
📝 Inserindo em five_mind_results: {...}
✅ Resultado do FiveMind salvo com sucesso: {...}
🔄 Trigger deve atualizar users.analise_perfil automaticamente
✅ [AssessmentContent] Salvamento concluído com sucesso
```

#### Logs de Erro Comuns

**Erro: "relation does not exist"**
```
❌ Erro ao salvar em five_mind_results: {
  code: '42P01',
  message: 'relation "public.five_mind_results" does not exist'
}
```
**Solução**: Execute o SQL `docs/SQL/create_assessment_tables.sql`

**Erro: "new row violates row-level security policy"**
```
❌ Erro ao salvar em five_mind_results: {
  code: '42501',
  message: 'new row violates row-level security policy'
}
```
**Solução**: Verifique se as políticas RLS foram criadas corretamente

**Erro: "permission denied for table"**
```
❌ Erro ao salvar em five_mind_results: {
  code: '42501',
  message: 'permission denied for table five_mind_results'
}
```
**Solução**: Verifique se o usuário está autenticado e se as políticas RLS permitem INSERT

**Erro: "null value in column violates not-null constraint"**
```
❌ Erro ao salvar em five_mind_results: {
  code: '23502',
  message: 'null value in column "openness" violates not-null constraint'
}
```
**Solução**: Verifique se todos os campos obrigatórios estão sendo enviados

### Verificações no Banco de Dados

1. **Verificar se os dados foram salvos**
   ```sql
   -- Verificar assessment_results
   SELECT * FROM assessment_results 
   WHERE user_id = 'SEU_USER_ID' 
   ORDER BY completed_at DESC 
   LIMIT 5;
   
   -- Verificar five_mind_results
   SELECT * FROM five_mind_results 
   WHERE user_id = 'SEU_USER_ID' 
   ORDER BY completed_at DESC 
   LIMIT 5;
   
   -- Verificar hexa_mind_results
   SELECT * FROM hexa_mind_results 
   WHERE user_id = 'SEU_USER_ID' 
   ORDER BY completed_at DESC 
   LIMIT 5;
   ```

2. **Verificar se o trigger atualizou profile_analysis**
   ```sql
   SELECT id, full_name, profile_analysis 
   FROM users 
   WHERE id = 'SEU_USER_ID';
   ```

### Problemas Comuns e Soluções

#### 1. Tabelas não existem
**Sintoma**: Erro "relation does not exist"  
**Solução**: Execute `docs/SQL/create_assessment_tables.sql`

#### 2. Políticas RLS bloqueando
**Sintoma**: Erro "new row violates row-level security policy"  
**Solução**: Verifique se as políticas RLS foram criadas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'five_mind_results';
```

#### 3. Usuário não autenticado
**Sintoma**: Logs mostram "⚠️ Usuário não autenticado"  
**Solução**: Verifique se o usuário está logado e se `AuthClientProvider` está funcionando

#### 4. Formato de dados incorreto
**Sintoma**: Erro de constraint ou tipo  
**Solução**: Verifique os logs do console para ver o formato dos dados sendo enviados

#### 5. Trigger não executando
**Sintoma**: Dados salvos mas `profile_analysis` não atualizado  
**Solução**: Verifique se os triggers foram criados:
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('five_mind_results', 'hexa_mind_results');
```

### Teste Manual

1. Abra o console do navegador (F12)
2. Complete uma avaliação
3. Observe os logs
4. Verifique no Supabase se os dados foram salvos
5. Se houver erro, copie a mensagem completa e verifique nesta documentação

### Contato

Se o problema persistir após seguir todos os passos, verifique:
- Logs completos do console
- Logs do Supabase (Database Logs)
- Estrutura das tabelas no banco de dados

