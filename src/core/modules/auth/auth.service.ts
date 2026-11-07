import { prisma } from "@/infra/prisma";
import { hashPassword, verifyPassword } from "./password";
import type { LoginInput, RegisterInput } from "./auth.schemas";

export type RegisterResult =
  | { ok: true; userId: string; role: "CUSTOMER" | "ADMIN" }
  | { ok: false; error: "EMAIL_IN_USE" };

export type LoginResult =
  | { ok: true; userId: string; role: "CUSTOMER" | "ADMIN" }
  | { ok: false; error: "INVALID_CREDENTIALS" };

const dummyHashPromise = hashPassword("senha-que-nao-existe");

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

export async function loginUser(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, role: true, passwordHash: true },
  });

  const hashToCheck = user?.passwordHash ?? (await dummyHashPromise);
  const passwordMatches = await verifyPassword(input.password, hashToCheck);

  if (!user || !passwordMatches) {
    return { ok: false, error: "INVALID_CREDENTIALS" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return { ok: true, userId: user.id, role: user.role };
}