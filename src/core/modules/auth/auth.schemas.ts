import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "E-mail muito longo.")
  .pipe(z.email("Informe um e-mail válido."));

const passwordRules = z
  .string()
  .min(8, "Use ao menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.")
  .regex(/[A-Za-z]/, "A senha precisa ter ao menos uma letra.")
  .regex(/\d/, "A senha precisa ter ao menos um número.");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Informe seu nome completo.")
      .max(200, "Nome muito longo.")
      .refine(
        (value) => value.split(/\s+/).length >= 2,
        "Informe nome e sobrenome.",
      ),
    email: emailSchema,
    password: passwordRules,
    confirmPassword: z.string(),
    acceptedTerms: z
      .boolean()
      .refine((value) => value === true, "Você precisa aceitar os Termos de Serviço."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe sua senha."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;