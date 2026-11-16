import { config } from "dotenv";
import { defineConfig } from "vitest/config";

// Carrega o .env.test por cima do .env antes de tudo: os testes, o globalSetup e o
// Prisma CLI chamado por ele herdam esse DATABASE_URL (o banco *_test).
config({ path: ".env.test", override: true, quiet: true });

export default defineConfig({
    // Resolve os aliases @/ do tsconfig (suporte nativo do Vite 8).
    resolve: { tsconfigPaths: true },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        globalSetup: "./src/test/global-setup.ts",
        // Todos os arquivos usam o mesmo banco de teste.
        fileParallelism: false,
    },
});
