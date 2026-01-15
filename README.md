# Kynex Hub - Monorepo

Sistema de gestão para agências digitais, com aplicações separadas para administração e clientes.

## 📁 Estrutura do Monorepo

```
agencia-hub/
├── apps/
│   ├── admin/          # Aplicação de administração (Vite + React + TypeScript)
│   └── client/         # Aplicação para clientes (Vite + React + TypeScript)
├── shared/             # Código compartilhado entre aplicações
│   ├── types/          # Tipos TypeScript compartilhados
│   ├── utils/          # Funções utilitárias
│   └── api/            # Configuração de API e cliente Supabase
├── supabase/           # Configurações e migrations do Supabase
└── package.json        # Configuração do workspace raiz
```

## 🚀 Como começar

### Pré-requisitos

- Node.js >= 18.0.0
- npm ou yarn

### Instalação

```sh
# 1. Clone o repositório
git clone <YOUR_GIT_URL>

# 2. Entre no diretório do projeto
cd agencia-hub

# 3. Instale todas as dependências (root + workspaces)
npm install

# 4. Configure as variáveis de ambiente
# Copie o arquivo .env para cada aplicação se necessário
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```sh
# Rodar aplicação admin
npm run dev:admin

# Rodar aplicação client
npm run dev:client

# Ou entre no diretório específico
cd apps/admin
npm run dev
```

### Build

```sh
# Build da aplicação admin
npm run build:admin

# Build da aplicação client
npm run build:client

# Build de todas as aplicações
npm run build:all
```

### Outros

```sh
# Limpar node_modules e builds
npm run clean

# Reinstalar todas as dependências
npm run clean && npm install
```

## 📦 Workspaces

Este projeto usa npm workspaces para gerenciar múltiplos pacotes:

- **@agencia-hub/admin** - Aplicação de administração
- **@agencia-hub/client** - Aplicação para clientes
- **@agencia-hub/shared** - Código compartilhado

## 🧩 Shared Package

O pacote `shared` contém código reutilizável entre as aplicações:

### Types
```typescript
import { Client, SocialMetrics, ContentApproval } from '@agencia-hub/shared/types'
```

### Utils
```typescript
import { formatDate, formatPhone, isValidEmail } from '@agencia-hub/shared/utils'
```

### API
```typescript
import { supabase, fetchApi } from '@agencia-hub/shared/api'
```

## 🔧 Tecnologias

### Apps (Admin & Client)
- **Vite** - Build tool e dev server
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento

### Admin específico
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Supabase** - Backend e autenticação
- **TanStack Query** - Gerenciamento de estado servidor

## 🌐 Deploy

### Vercel (Recomendado)

Cada aplicação possui seu próprio `vercel.json` configurado.

```sh
# Deploy admin
cd apps/admin
vercel

# Deploy client
cd apps/client
vercel
```

### Configuração de variáveis de ambiente

Certifique-se de configurar as variáveis de ambiente no painel da Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (se aplicável)

## 📝 Desenvolvimento

### Adicionando nova dependência

```sh
# Para uma aplicação específica
npm install <package> --workspace=apps/admin

# Para o shared package
npm install <package> --workspace=shared

# Para o root (dev tools)
npm install <package> -D
```

### Criando componentes compartilhados

1. Adicione o componente em `shared/components/`
2. Exporte no `shared/index.ts`
3. Use nas aplicações: `import { Component } from '@agencia-hub/shared'`

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nome`
2. Faça commit das mudanças: `git commit -m 'Add: nova feature'`
3. Push para a branch: `git push origin feature/nome`
4. Abra um Pull Request

## PENDÊNCIAS RENOMEAÇÃO

### FALTA ALTERAR:

#### URL's das Logos
- apps/admin/src/contexts/ThemeContext.tsx: linhas 46, 47, 48 e 49 `alteração dos links das logos - página admin`
- apps/client/src/contexts/ThemeContext.tsx: linhas 16, 17, 18, 19 e 20 `alteração dos links das logos - página cliente`

#### Domínios e Subdomínios
- kynex-hub/supabase/functions/grant-access/index.ts: linha 74 `envio de acesso`
- kynex-hub/apps/admin/src/pages/N8N.tsx: linha 7 `domínio n8n`
- kynex-hub/apps/admin/src/pages/Configuracoes.tsx: linha 22 `domínio n8n`
- kynex-hub/apps/admin/src/pages/Configuracoes.tsx: linha 22 `domínio n8n`

## 📄 Licença

Este projeto é privado e confidencial. O acesso ao código-fonte não concede qualquer direito de uso, cópia, modificação, redistribuição ou exploração, total ou parcial.
Qualquer reprodução, compartilhamento ou utilização não autorizada é expressamente proibida e poderá resultar em medidas legais cabíveis, incluindo responsabilização civil e judicial.

---
