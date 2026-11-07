import { prisma } from "@/infra/prisma";
import { hashPassword } from "./password";
import type { RegisterInput } from "./auth.schemas";

export type RegisterResult =
  | { ok: true; userId: string; role: "CUSTOMER" | "ADMIN" }
  | { ok: false; error: "EMAIL_IN_USE" };

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const [first = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName: first.slice(0, 100),
    lastName: rest.join(" ").slice(0, 100),
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const { firstName, lastName } = splitFullName(input.fullName);
  const passwordHash = await hashPassword(input.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName,
        lastName,
      },
      select: { id: true, role: true },
    });

    return { ok: true, userId: user.id, role: user.role };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "EMAIL_IN_USE" };
    }
    throw error;
  }
}