import { z } from "zod";
import { isCardExpired, isValidCardNumber } from "@/utils/validators/card";
import { isValidCpf, normalizeCpf } from "@/utils/validators/cpf";

export const orderIdSchema = z.uuid();
export const idempotencyKeySchema = z.uuid();

const cpfSchema = z
    .string()
    .trim()
    .transform(normalizeCpf)
    .refine(isValidCpf, "CPF inválido.");

const cardExpirySchema = z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use o formato MM/AA.")
    .refine((value) => {
        const [month, year] = value.split("/").map(Number);
        return !isCardExpired(month, year);
    }, "Cartão vencido.");

export const paymentInputSchema = z.discriminatedUnion("method", [
    z.object({
        method: z.literal("card"),
        holderName: z.string().trim().min(3, "Informe o nome impresso no cartão.").max(100),
        cardNumber: z.string().refine(isValidCardNumber, "Número de cartão inválido."),
        expiry: cardExpirySchema,
        cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido."),
        cpf: cpfSchema,
    }),
    z.object({ method: z.literal("pix"), cpf: cpfSchema }),
    z.object({ method: z.literal("boleto"), cpf: cpfSchema }),
]);

export type PaymentInput = z.infer<typeof paymentInputSchema>;
export type PaymentMethod = PaymentInput["method"];
