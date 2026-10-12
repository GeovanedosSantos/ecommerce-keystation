# Ecommerce Keystation

Repositório do projeto da A3 de Usabilidade, desenvolvimento web, mobile e jogos

## Tecnologias

**Frontend:** Node,js, Next.js, TypeScript, React, Css Modules (BEM) \
**Backend:** Node.js, Next.js, TypeScript, Prisma (ORM), Zod\
**Banco de Dados:** PostgreSQL

## Organização de pastas

### Frontend

`src/app/` onde as páginas e features ficam por módulo\
`src/components/` componentes reutilizáveis\
`src/utils/` funções reutilizáveis como formatadores e validadores

### Backend

`src/core/modules` regras de negócio (services)\
`prisma/` schemas e migrations do banco de dados\
`src/infra/` pasta com as ferramentas de infraestrutura usadas no projeto

## Como rodar:

Clone o repositório, e instale a versão do node que está no arquivo .nvmrc

### Frontend:

dê o comando para instalar as dependências:

``` bash
npm install
```

e depois rode:

``` bash
npm run dev
``` 

As páginas que consultam dados precisam do banco; veja a seção Backend.

### Backend:

o servidor do backend e do frontend é o mesmo, rodando `npm run dev` os dois já sobem.

Copie o arquivo .env.example como .env e depois substitua as variáveis de ambiente

após isso execute o comando do docker para subir o banco de dados:

``` bash
docker compose up -d
```

e execute para iniciar as migrations e os dados de exemplo

``` bash
npx prisma migrate dev      # cria as tabelas
npx prisma db seed         # dados de exemplo
```
