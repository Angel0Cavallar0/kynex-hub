# Kynex Hub - Monorepo

Sistema completo de gestão empresarial para agências digitais, integrando CRM, comunicação via WhatsApp, gerenciamento de tarefas com ClickUp, automação de workflows com N8N e transcrição de reuniões com IA.

## 📁 Estrutura do Monorepo

```
kynex-hub/
├── apps/
│   ├── admin/              # Aplicação administrativa completa
│   │   ├── src/
│   │   │   ├── pages/      # 19+ páginas (Dashboard, CRM, WhatsApp, ClickUp, etc.)
│   │   │   ├── components/ # Componentes UI (shadcn/ui)
│   │   │   └── contexts/   # Auth, Theme contexts
│   │   └── package.json
│   └── client/             # Portal simplificado para clientes
│       ├── src/
│       │   ├── pages/      # Dashboard e Login
│       │   └── components/
│       └── package.json
├── shared/                 # Código compartilhado
│   ├── types/             # Interfaces TypeScript (Client, User, SocialMetrics, etc.)
│   ├── utils/             # Funções utilitárias (formatDate, formatPhone, validation)
│   └── api/               # Cliente Supabase e helpers de API
├── supabase/              # Backend Supabase
│   ├── functions/         # Edge Functions (grant-access, revoke-access)
│   └── migrations/        # SQL migrations
└── package.json           # Workspace raiz com npm workspaces
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
cd kynex-hub

# 3. Instale todas as dependências (root + workspaces)
npm install

# 4. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz com:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=optional_api_url
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

## 🎯 Funcionalidades Principais

### Aplicação Admin

#### Gestão Central
- **Dashboard**: Estatísticas em tempo real (Clientes Ativos, Colaboradores, Tarefas em Andamento, Tarefas Atrasadas)
- **Gestão de Clientes**: CRUD completo com dados empresariais (CNPJ, razão social, segmento, status)
- **Gestão de Colaboradores**: Controle de funcionários com cargos, contatos e IDs de integração

#### CRM Completo
- **Pipelines de Vendas**: Múltiplos funis customizáveis (Prospecção, Nutrição, etc.)
- **Gestão de Negócios**: Kanban e lista com filtros por proprietário, pipeline e estágio
- **Empresas e Contatos**: Cadastro completo com documentos, telefones e relacionamentos
- **Timeline de Atividades**: Notas e histórico de cada negócio
- **Controle de Permissões**: Acesso diferenciado por nível (Admin, Gerente, Supervisor, Assistente, Básico)

#### Integração WhatsApp
- **Conversas em Tempo Real**: Suporte a chats individuais e grupos
- **Múltiplos Formatos**: Texto, imagens, vídeos, áudio com transcrição, documentos
- **Funções Avançadas**: Arquivar, encaminhar, responder, deletar mensagens
- **Webhook Integration**: Integração com sistemas externos
- **Real-time Updates**: Atualização instantânea via Supabase subscriptions

#### Integração ClickUp
- **4 Módulos**: Tarefas, Responsáveis, Pastas, Listas
- **Sincronização**: Dados armazenados no Supabase e sincronizados com ClickUp
- **Filtros Avançados**: Por cliente, colaborador, status e prioridade
- **Mapeamento de Pastas**: Vinculação de pastas do ClickUp com clientes

#### Automação com N8N
- **Interface Integrada**: Iframe embarcado no sistema
- **Configuração Flexível**: URL configurável nas settings globais
- **Workflows**: Automação de processos empresariais

#### Sistema de Reuniões
- **Upload de Áudio**: Envio de gravações de reuniões
- **Transcrição com IA**: Processamento automático via webhook
- **Análise Estruturada**:
  - Resumo executivo
  - Tópicos discutidos
  - Decisões tomadas
  - Próximos passos
  - Pendências e riscos

#### Logs do Sistema
- **Monitoramento**: Registro de todas as atividades do sistema
- **Filtros**: Por nível (info, warning, error, success)
- **Rastreabilidade**: Contexto detalhado e atribuição por usuário

#### Configurações Avançadas
- **Personalização Visual**: Tema (dark/light), cores primárias e secundárias, logo e favicon
- **Webhooks**: Configuração de URLs para WhatsApp e N8N
- **Controle de Acesso**: Sistema granular de permissões por funcionalidade (CRM, WhatsApp, N8N)

### Aplicação Client
- **Portal Simplificado**: Interface limpa para acesso de clientes
- **Dashboard**: Visualização de informações pertinentes ao cliente
- **Autenticação Segura**: Login via Supabase Auth

## 📦 Workspaces

Este projeto usa npm workspaces para gerenciar múltiplos pacotes:

- **@agencia-hub/admin** - Aplicação administrativa completa com 19+ páginas
- **@agencia-hub/client** - Portal simplificado para clientes
- **@agencia-hub/shared** - Código compartilhado (tipos, utils, API client)

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

## 🔧 Stack Tecnológico

### Frontend (Ambas as Aplicações)
- **Vite 5.4** - Build tool ultra-rápido e dev server
- **React 18.3** - Biblioteca UI com hooks modernos
- **TypeScript 5.8** - Tipagem estática e IntelliSense
- **React Router v6** - Roteamento declarativo
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Lucide React** - Biblioteca de ícones moderna

### Admin - UI & Componentes
- **shadcn/ui** - Biblioteca completa de componentes (40+ componentes):
  - Radix UI primitives (Dialog, Dropdown, Select, Tabs, Toast, etc.)
  - Accordion, Alert Dialog, Avatar, Checkbox, Collapsible
  - Context Menu, Hover Card, Label, Menubar, Navigation Menu
  - Popover, Progress, Radio Group, Scroll Area, Separator
  - Slider, Switch, Toggle, Tooltip
- **@hello-pangea/dnd** - Drag and drop para Kanban
- **Embla Carousel** - Carrosséis responsivos
- **React Resizable Panels** - Painéis redimensionáveis
- **Vaul** - Drawer/Sheet components

### Admin - Formulários & Validação
- **React Hook Form 7.61** - Gerenciamento de formulários performático
- **Zod 3.25** - Schema validation TypeScript-first
- **@hookform/resolvers** - Integração RHF + Zod

### Admin - Data & Estado
- **TanStack Query 5.83** - Server state management e caching
- **@supabase/supabase-js 2.79** - Cliente oficial do Supabase
- **Date-fns 3.6** - Manipulação de datas moderna

### Admin - Visualização de Dados
- **Recharts 2.15** - Gráficos e charts interativos
- **React Day Picker** - Date picker com calendário

### Admin - Outros
- **CMDK** - Command palette (Cmd+K UI)
- **Sonner** - Toast notifications elegantes
- **Next Themes** - Gerenciamento de tema dark/light
- **Input OTP** - Input para códigos OTP/verificação
- **Class Variance Authority** - Variantes de componentes tipadas
- **Tailwind Merge** - Merge inteligente de classes Tailwind

### Backend & Infraestrutura
- **Supabase** (Stack completo):
  - **PostgreSQL** - Banco de dados relacional
  - **PostgREST** - API REST automática
  - **GoTrue** - Autenticação e autorização
  - **Realtime** - WebSockets para atualizações em tempo real
  - **Storage** - Armazenamento de arquivos (WhatsApp media)
  - **Edge Functions** - Deno runtime serverless (grant-access, revoke-access)
  - **Row Level Security (RLS)** - Segurança no nível de linha

### Integrações Externas
- **ClickUp API** - Sincronização de tarefas, pastas e listas
- **WhatsApp Business API** - Mensagens, grupos e webhooks
- **N8N** - Automação de workflows (iframe embed)
- **Webhook IA** - Transcrição e análise de reuniões

### Build & Ferramentas
- **@vitejs/plugin-react-swc** - Fast Refresh com SWC compiler
- **ESLint 9** - Linting de código
- **TypeScript ESLint** - Regras específicas para TypeScript
- **PostCSS** - Transformações CSS
- **Autoprefixer** - Vendor prefixes automáticos

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

## 🗺️ Rotas e Páginas

### Admin Application (19 rotas protegidas)

**Autenticação**
- `/login` - Login administrativo
- `/signup` - Cadastro de administrador

**Dashboard & Home**
- `/home` - Página inicial
- `/dashboard` - Dashboard com estatísticas em tempo real

**Gestão de Clientes**
- `/clientes` - Lista de clientes
- `/clientes/novo` - Criar novo cliente
- `/clientes/:id` - Detalhes do cliente

**Gestão de Colaboradores**
- `/colaboradores` - Lista de colaboradores
- `/colaboradores/novo` - Criar novo colaborador
- `/colaboradores/:id` - Detalhes do colaborador

**ClickUp (4 sub-páginas)**
- `/clickup/tarefas` - Visualização e gestão de tarefas
- `/clickup/responsaveis` - Gestão de responsáveis por tarefas
- `/clickup/pastas` - Organização de pastas por cliente
- `/clickup/listas` - Visualização de listas de tarefas

**Comunicação & Automação**
- `/whatsapp` - Interface de chat WhatsApp com mensagens em tempo real
- `/n8n` - Plataforma de automação N8N (iframe)
- `/reunioes` - Upload e transcrição de reuniões com IA

**CRM**
- `/crm` - Módulo CRM completo (Negócios, Empresas, Contatos)

**Sistema**
- `/logs` - Logs de atividades do sistema
- `/configuracoes` - Configurações globais e personalizações
- `/perfil` - Perfil do usuário

### Client Application (2 rotas)
- `/login` - Login do cliente
- `/dashboard` - Dashboard do cliente

## 🗄️ Banco de Dados (Principais Tabelas)

### Gestão de Usuários e Acesso
- `user_roles` - Controle de permissões por usuário (role, crm_access, wpp_access, n8n_access)

### Clientes e Colaboradores
- `clients` - Dados dos clientes (nome_fantasia, razao_social, cnpj, segmento, cliente_ativo)
- `colaborador` - Dados dos colaboradores (nome, sobrenome, cargo, email, id_clickup)

### CRM
- `crm_pipelines` - Funis de vendas
- `crm_stages` - Estágios dos pipelines (cores, ordem, is_won, is_lost)
- `crm_companies` - Empresas no CRM
- `crm_contacts` - Contatos das empresas
- `crm_deals` - Negócios/Oportunidades (valor, owner, status, data de fechamento)
- `crm_deal_notes` - Timeline e notas dos negócios
- `crm_settings` - Configurações do CRM

### WhatsApp
- `chat_messages` - Mensagens de chat individual (text, image, video, audio com transcrição, documentos)
- `group_messages` - Mensagens de grupos

### ClickUp
- `informacoes_tasks_clickup` - Informações das tarefas sincronizadas
- `clientes_pastas_clickup` - Mapeamento de pastas do ClickUp com clientes

### Sistema
- `system_logs` - Logs de atividades (timestamp, level, code, message, user_id, context)
- `global_settings` - Configurações globais (tema, logos, URLs de webhook)

### Storage Buckets
- `whatsapp` - Armazenamento de mídia do WhatsApp (imagens, vídeos, áudios, documentos)

## 🔐 Sistema de Permissões

### Níveis de Acesso (hierárquico)
1. **Admin** - Acesso total, incluindo configurações do sistema
2. **Manager** - Acesso amplo, sem acesso a configurações globais
3. **Supervisor** - Visualização de dados sensíveis, sem edição
4. **Assistant** - Uso operacional (WhatsApp, CRM se permitido)
5. **Basic** - Acesso restrito apenas aos próprios dados

### Permissões Específicas (flags booleanas)
- `crm_access` - Habilita acesso ao módulo CRM
- `wpp_access` / `wpp_acess` - Habilita acesso ao WhatsApp
- `n8n_access` - Habilita acesso ao N8N
- `client_access` - Habilita acesso ao portal do cliente

**Nota**: No CRM, usuários Admin/Manager veem todos os negócios, enquanto outros níveis veem apenas negócios atribuídos a eles.

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/nome`
2. Faça commit das mudanças: `git commit -m 'Add: nova feature'`
3. Push para a branch: `git push origin feature/nome`
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e confidencial. O acesso ao código-fonte não concede qualquer direito de uso, cópia, modificação, redistribuição ou exploração, total ou parcial.
Qualquer reprodução, compartilhamento ou utilização não autorizada é expressamente proibida e poderá resultar em medidas legais cabíveis, incluindo responsabilização civil e judicial.

---
