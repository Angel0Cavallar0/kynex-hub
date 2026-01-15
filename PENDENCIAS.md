# Pendências de Renomeação

Este arquivo contém URLs e domínios hardcoded que precisam ser alterados durante uma eventual renomeação ou migração do projeto.

## ⚠️ URLs das Logos

### Admin Application
**Arquivo**: `apps/admin/src/contexts/ThemeContext.tsx`
- **Linha 46**: URL da logo (modo claro)
- **Linha 47**: URL da logo (modo escuro)
- **Linha 48**: URL do favicon (modo claro)
- **Linha 49**: URL do favicon (modo escuro)

### Client Application
**Arquivo**: `apps/client/src/contexts/ThemeContext.tsx`
- **Linha 16**: URL da logo principal
- **Linha 17**: URL da logo alternativa
- **Linha 18**: URL do favicon principal
- **Linha 19**: URL do favicon alternativo
- **Linha 20**: Configuração adicional de logo

## 🌐 Domínios e Subdomínios

### Edge Function - Grant Access
**Arquivo**: `supabase/functions/grant-access/index.ts`
- **Linha 74**: URL de envio de acesso (provavelmente email ou webhook)
- **Contexto**: Envio de credenciais/links de acesso aos usuários

### N8N Integration
**Arquivo**: `apps/admin/src/pages/N8N.tsx`
- **Linha 7**: URL padrão do domínio N8N
- **Valor atual esperado**: `https://n8n.camaleon.com.br/`

**Arquivo**: `apps/admin/src/pages/Configuracoes.tsx`
- **Linha 22**: Configuração do domínio N8N (primeira referência)
- **Linha 22**: Configuração do domínio N8N (segunda referência - duplicada?)

---

## 📝 Checklist para Renomeação

Ao realizar uma renomeação do projeto, certifique-se de atualizar:

- [ ] URLs das logos no ThemeContext do Admin (4 linhas)
- [ ] URLs das logos no ThemeContext do Client (5 linhas)
- [ ] URL de envio de acesso na Edge Function grant-access
- [ ] Domínio N8N em N8N.tsx
- [ ] Domínio N8N em Configuracoes.tsx
- [ ] Verificar se há outras referências hardcoded usando busca global:
  - `grep -r "camaleon.com.br" .`
  - `grep -r "admin.camaleon" .`
  - `grep -r "https://" apps/ | grep -v node_modules`

## 💡 Recomendações

Para evitar problemas futuros com URLs hardcoded:

1. **Centralizar configurações**: Mover todas as URLs para variáveis de ambiente (.env)
   ```env
   VITE_LOGO_LIGHT=https://...
   VITE_LOGO_DARK=https://...
   VITE_N8N_URL=https://n8n.exemplo.com.br
   ```

2. **Usar configurações globais do Supabase**: As URLs já podem ser armazenadas na tabela `global_settings`

3. **Criar constantes compartilhadas**: Em `shared/constants.ts` para URLs e domínios fixos

4. **Documentar dependências externas**: Manter lista atualizada de todos os domínios e serviços utilizados
