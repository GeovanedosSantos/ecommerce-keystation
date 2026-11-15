import { execSync } from "node:child_process";

/**
 * Prepara o banco de teste uma vez por execução do Vitest, aplicando as migrations
 * pendentes. Os dados são limpos a cada teste pelo `resetDatabase` (src/test/db.ts).
 *
 * Se uma migration já aplicada for editada, recrie o banco de teste à mão:
 *   docker compose exec db dropdb -U <POSTGRES_USER> ecommerce_db_test
 *   docker compose exec db createdb -U <POSTGRES_USER> ecommerce_db_test
 */
export default function setup() {
    // Trava de segurança: os testes esvaziam as tabelas, então só rodam em um banco *_test.
    if (!process.env.DATABASE_URL?.includes("_test")) {
        throw new Error("DATABASE_URL não aponta para um banco *_test. Confira o .env.test");
    }

    execSync("npx prisma migrate deploy", { stdio: "inherit" });
}
