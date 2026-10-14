# GEMINI.md - Diretrizes do Projeto Ecommerce Keystation

Este documento contém as diretrizes de arquitetura, padrões de projeto, convenções de código e comandos essenciais para o desenvolvimento no repositório **Ecommerce Keystation**.

---

## 1. Visão Geral

- **Projeto:** Ecommerce Keystation (Projeto acadêmico / A3 de Usabilidade, Desenvolvimento Web, Mobile e Jogos).
- **Modelo:** Aplicação full-stack utilizando Next.js com App Router.
- **Node.js:** Versão fixada via `.nvmrc` (`24.21.0`).

### Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, CSS Modules (BEM). Biblioteca `lucide-react` para ícones. |
| **Backend** | Next.js (Route Handlers / Server Actions), TypeScript |
| **ORM & Validação** | Prisma v7 (`@prisma/adapter-pg`), Zod |
| **Banco de Dados** | PostgreSQL 16 (Docker Compose) |
| **Linter / Estilo** | ESLint 9 (Flat config) |

---

## 2. Estrutura de Diretórios

A aplicação segue uma separação clara entre frontend, regras de negócio e infraestrutura:

```text
ecommerce-keystation/
├── prisma/                    # Schemas, migrations e seeds do Prisma
│   └── schema.prisma
├── public/                    # Arquivos estáticos públicos
├── src/
│   ├── app/                   # Rotas e páginas (Next.js App Router)
│   │   ├── api/               # Endpoints HTTP / Route Handlers (quando aplicável)
│   │   ├── globals.css        # Estilos globais
│   │   └── layout.tsx         # Layout raiz da aplicação
│   ├── components/            # Componentes visuais reutilizáveis
│   ├── core/
│   │   └── modules/           # Regras de negócio, casos de uso e serviços
│   ├── infra/                 # Clientes e adaptadores externos (ex: Prisma client, db adapter)
│   ├── utils/                 # Utilitários puros (formatadores, validadores, helpers)
│   └── generated/             # Artefatos gerados (ex: prisma client gerado em src/generated/prisma)
├── docker-compose.yml         # Configuração do PostgreSQL local
├── package.json
└── tsconfig.json              # Configurações TypeScript (alias @/* mapeado para ./src/*)
```

---

## 3. Padrões de Código e Arquitetura

### 3.1. Arquitetura em Camadas
- **Apresentação (`src/app/`, `src/components/`):** Componentes React puros e páginas Next.js. Não devem conter lógica de negócio acoplada diretamente ou queries manuais complexas.
- **Regras de Negócio (`src/core/modules/`):** Serviços e casos de uso independentes do framework web. Devem ser testáveis e reutilizáveis.
- **Infraestrutura (`src/infra/`):** Conexão com o banco (instância do Prisma Client com adapter PostgreSQL), APIs externas, clientes de mensageria ou e-mail.
- **Validação de Dados:** Usar schemas do **Zod** para validar payloads de requisição, formulários e respostas antes do processamento.

### 3.2. Estilização
- Utilizar **CSS Modules** (`*.module.css`) associados aos componentes.
- Seguir a convenção de nomenclatura **BEM** (Block Element Modifier):
  ```css
  /* Exemplo: Button.module.css */
  .button { ... }
  .button__icon { ... }
  .button--primary { ... }
  ```
  **Breakpoints para responsividade:**
  - `@media (min-width: 640px) ou 768px`: Telas de tablets ou celulares grandes em modo paisagem.
  - `@media (min-width: 1024px)`: Notebooks e desktops pequenos.

### 3.3. Paleta de Cores ("Cyber Neon")
Paleta moderna e vibrante (estilo Cyberpunk/Twitch), excelente para chamar atenção para botões de compra:
- **Fundo Principal (Background):** `#0F172A` (Azul-marinho muito escuro, quase preto). Use no `body` da aplicação.
- **Superfícies (Cards, Header, Footer):** `#1E293B` (Cinza-azulado escuro). Cria hierarquia visual.
- **Cor Primária (Ação Principal):** `#8B5CF6` (Roxo Vibrante). Botão "Comprar", promoções e ícones.
- **Cor Secundária (Hover/Apoio):** `#06B6D4` (Ciano/Neon). Links, focus de inputs e tags de gênero.
- **Texto Principal:** `#F8FAFC` (Branco gelo). Evite branco puro (#FFFFFF) no fundo escuro.
- **Texto Secundário:** `#94A3B8` (Cinza claro). Descrições de jogos, requisitos e textos menores.
- **Sucesso / Resgate:** `#10B981` (Verde Esmeralda). Botão "Revelar Chave", mensagens de pagamento aprovado e preço com desconto.

### 3.4. TypeScript & Boas Práticas
- Manter o modo estrito (`strict: true`) do TypeScript.
- Evitar o uso de `any`; criar tipagens explícitas ou inferir via Zod (`z.infer<typeof schema>`).
- Utilizar import aliases configurados: `@/components/...`, `@/core/...`, `@/infra/...`, `@/utils/...`.
- Não suprimir avisos do linter/compilador com comentários desnecessários (`@ts-ignore` ou `eslint-disable`), corrigindo a causa raiz.

---

## 4. Banco de Dados e Prisma

- O banco local roda via Docker PostgreSQL:
  ```bash
  docker compose up -d
  ```
- O schema do Prisma está localizado em `prisma/schema.prisma` e sua configuração em `prisma7.config.ts`.
- O cliente Prisma é gerado em `src/generated/prisma`.
- Nunca commitar senhas reais ou arquivos `.env`. Utilize sempre `.env.example` como modelo.

---

## 5. Requisitos Funcionais

### 5.1. Navegação e Catálogo de Produtos
- Página inicial com banners de destaques, promoções, lançamentos, jogos mais vendidos e categorias.
- Busca de jogos através de barra de pesquisa.
- Filtros no catálogo por gênero, faixa de preço e desenvolvedora.
- Ordenação por Menor Preço, Maior Preço e Relevância.
- Página de detalhes do produto com imagens/trailer, sinopse, requisitos de sistema, preço e avaliações.
- Paginação no catálogo de jogos.

### 5.2. Carrinho e Checkout
- Adição de jogos ao carrinho, com lista, cálculo de subtotal e remoção de itens.
- Aplicação de cupom de desconto no carrinho.
- Seleção de método de pagamento no checkout (Cartão de Crédito, Pix ou Boleto).
- Formulários dinâmicos (campos de cartão ou QR Code Pix).
- Processamento sem cálculo de frete (produto digital).
- Redirecionamento para página de sucesso após aprovação do pagamento com número do pedido.

### 5.3. Autenticação e Gestão de Conta
- Cadastro de usuários: Nome Completo, E-mail, Senha, Confirmação de Senha e checkbox de Termos de Serviço.
- Login via e-mail/senha e login social (Google/Steam).
- Solicitação de recuperação de senha via link por e-mail.
- Edição de dados no painel da conta (avatar, nome e senha).

### 5.4. Área do Cliente e Inventário
- Histórico de pedidos ("Meus Pedidos") com data, itens, valor total e status (Pendente, Aprovado, Cancelado).
- Inventário ("Minhas Chaves" ou "Cofre") com os jogos comprados.
- Chave digital oculta inicialmente, com botão "Revelar Chave".
- Cópia da chave digital com feedback visual "Copiado!".

### 5.5. Suporte, Informações e Área Administrativa
- Formulário de contato (Nome, E-mail, Assunto dropdown e Mensagem).
- Páginas informativas (Termos de Serviço, Política de Reembolso, Tutorial de resgate na Steam).
- Dashboard para administradores visualizarem resumo geral de vendas e faturamento.
- Cadastro de novos jogos pelo administrador (título, descrição, preço e imagens).

---

## 6. Comandos e Scripts Úteis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js |
| `npm run build` | Compila o projeto para produção |
| `npm run start` | Inicia a aplicação compilada |
| `npm run lint` | Executa o linter ESLint |
| `docker compose up -d` | Sobe o banco de dados PostgreSQL |
| `docker compose down` | Encerra os contêineres do Docker |
| `npx prisma migrate dev` | Aplica migrações pendentes em desenvolvimento |
| `npx prisma generate` | Regenera o Prisma Client |
| `npx prisma db seed` | Executa o seed de dados de exemplo |
| `npx prisma studio` | Abre a interface visual para gerenciar dados do banco |


