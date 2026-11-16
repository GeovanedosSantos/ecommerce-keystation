"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { registerSchema } from "@/core/modules/auth/auth.schemas";
import { registerUser } from "@/core/modules/auth/auth.service";
import { setSessionCookie } from "@/infra/session-cookie";

export type RegisterFormState = {
  fieldErrors: Record<string, string[] | undefined>;
  values: { fullName: string; email: string };
};

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const fullName = String(formData.get("fullName") ?? "");
  const email = String(formData.get("email") ?? "");

  const parsed = registerSchema.safeParse({
    fullName,
    email,
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    acceptedTerms: formData.get("acceptedTerms") === "on",
  });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { fullName, email },
    };
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    return {
      fieldErrors: { email: ["Este e-mail já está cadastrado."] },
      values: { fullName, email },
    };
  }

  await setSessionCookie({ userId: result.userId, role: result.role });
  redirect("/");
}