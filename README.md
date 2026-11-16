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

### Testes:

Os testes usam o Vitest e rodam contra um banco separado (`ecommerce_db_test`), no mesmo Postgres do Docker, para não mexer nos dados de desenvolvimento.

Crie um arquivo `.env.test` na raiz do projeto com o mesmo `DATABASE_URL` do `.env`, trocando só o nome do banco para `ecommerce_db_test`:

``` env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/ecommerce_db_test"
```

O `.env.test` não vai para o git. Sem ele, os testes param com o aviso "DATABASE_URL não aponta para um banco *_test", uma trava para nunca limpar o banco de desenvolvimento por engano.

Com o banco rodando (`docker compose up -d`), use:

``` bash
npm test                                          # roda e fica observando as mudanças (q para sair)
npm run test:run                                  # roda tudo uma vez
npx vitest run src/core/modules/product/schema.test.ts   # roda só um arquivo
npx vitest run -t "DLC"                           # roda só os testes com "DLC" no nome
npx vitest run --exclude "**/*.int.test.ts"       # pula os testes que usam o banco
```

Arquivos `*.test.ts` testam código puro (ex: validações do Zod) e arquivos `*.int.test.ts` testam os services contra o banco de teste. Os testes ficam ao lado do código que testam.

Se na primeira execução aparecer erro dizendo que o banco `ecommerce_db_test` não existe, crie ele uma vez (troque `<POSTGRES_USER>` pelo usuário do seu `.env`):

``` bash
docker compose exec db createdb -U <POSTGRES_USER> ecommerce_db_test
```

O banco de teste continua existindo depois dos testes: as tabelas são esvaziadas antes de cada teste, então não é preciso limpar nada à mão. Só recrie o banco se uma migration já aplicada for editada:

``` bash
docker compose exec db dropdb -U <POSTGRES_USER> ecommerce_db_test
docker compose exec db createdb -U <POSTGRES_USER> ecommerce_db_test
```
