import { prisma } from "@/infra/prisma";

/** Esvazia todas as tabelas (menos o histórico de migrations) para cada teste começar do zero. */
export async function resetDatabase() {
    // Mesma trava do global-setup: nunca esvaziar um banco que não seja de teste.
    if (!process.env.DATABASE_URL?.includes("_test")) {
        throw new Error("resetDatabase só roda em um banco *_test");
    }

    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;

    await prisma.$executeRawUnsafe(
        `TRUNCATE ${tables.map(({ tablename }) => `"${tablename}"`).join(", ")} CASCADE`,
    );
}
