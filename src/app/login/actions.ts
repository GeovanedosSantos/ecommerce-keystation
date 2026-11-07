"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { loginSchema } from "@/core/modules/auth/auth.schemas";
import { loginUser } from "@/core/modules/auth/auth.service";
import { setSessionCookie } from "@/infra/session-cookie";

export type LoginFormState = {
  fieldErrors: Record<string, string[] | undefined>;
  formError?: string;
  values: { email: string };
};

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");

  const parsed = loginSchema.safeParse({
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return {
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: { email },
    };
  }

  const result = await loginUser(parsed.data);

  if (!result.ok) {
    return {
      fieldErrors: {},
      formError: "E-mail ou senha incorretos.",
      values: { email },
    };
  }

  await setSessionCookie({ userId: result.userId, role: result.role });
  redirect("/");
}