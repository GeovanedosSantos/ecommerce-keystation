-- DropIndex
DROP INDEX "key_variant_id_idx";

-- CreateIndex
CREATE INDEX "key_variant_id_status_idx" ON "key"("variant_id", "status");
