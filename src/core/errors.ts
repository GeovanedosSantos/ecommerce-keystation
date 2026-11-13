import type { z, ZodError } from "zod";

export class ValidationError extends Error {
    constructor(readonly zodError: ZodError) {
        super("Dados inválidos");
    }
}

/** Valida o payload com o schema e lança `ValidationError` (400) se for inválido. */
export function parseOrThrow<T extends z.ZodType>(schema: T, payload: unknown): z.output<T> {
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
        throw new ValidationError(parsed.error);
    }

    return parsed.data;
}

export class UnauthorizedError extends Error {
    constructor(message = "Autenticação necessária") {
        super(message);
    }
}

export class ForbiddenError extends Error {
    constructor(message = "Acesso negado") {
        super(message);
    }
}

export class NotFoundError extends Error {}

export class ConflictError extends Error {}

export class UnprocessableEntityError extends Error {}
