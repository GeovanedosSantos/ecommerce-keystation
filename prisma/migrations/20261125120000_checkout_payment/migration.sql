-- AlterEnum
ALTER TYPE "key_status" ADD VALUE 'REVEALED';

-- AlterTable
ALTER TABLE "payment" ADD COLUMN "idempotency_key" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "payment_idempotency_key_key" ON "payment"("idempotency_key");
