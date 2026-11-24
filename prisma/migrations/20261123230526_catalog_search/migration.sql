-- Índice trigram para a busca com LIKE '%termo%'.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "developer_slug" VARCHAR(150),
ADD COLUMN     "search_text" TEXT NOT NULL DEFAULT '';

-- Preenche os produtos existentes com uma aproximação de normalizeSearchText e slugify.
-- O service (e o seed) regravam esses valores com as funções da aplicação.
UPDATE "product" SET
  "search_text" = trim(regexp_replace(lower(translate(
    "title" || ' ' || coalesce("developer", ''),
    'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
    'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn'
  )), '\s+', ' ', 'g')),
  "developer_slug" = nullif(trim(BOTH '-' FROM regexp_replace(
    replace(replace(lower(translate(
      coalesce("developer", ''),
      'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑáàâãäéèêëíìîïóòôõöúùûüçñ',
      'AAAAAEEEEIIIIOOOOOUUUUCNaaaaaeeeeiiiiooooouuuucn'
    )), '''', ''), '’', ''),
    '[^a-z0-9]+', '-', 'g'
  )), '');

ALTER TABLE "product" ALTER COLUMN "search_text" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "product_search_text_idx" ON "product" USING GIN ("search_text" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "product_developer_slug_idx" ON "product"("developer_slug");

-- CreateIndex
CREATE INDEX "product_variant_platform_id_status_idx" ON "product_variant"("platform_id", "status");
