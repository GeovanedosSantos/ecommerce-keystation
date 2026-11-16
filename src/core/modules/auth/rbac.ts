import { ForbiddenError, UnauthorizedError } from "@/core/errors";
import { getSession } from "@/infra/session-cookie";
import type { SessionPayload } from "./session";

/**
 * Garante que a requisição tem uma sessão válida.
 * Sem sessão → `UnauthorizedError`.
 */
export async function requireSession(): Promise<SessionPayload> {
    const session = await getSession();

    if (!session) {
        throw new UnauthorizedError();
    }

    return session;
}

/**
 * Garante que a requisição foi feita por um usuário com role ADMIN.
 * Toda Server Action administrativa deve chamar esta função, porque actions são
 * endpoints públicos mesmo quando o botão não aparece na tela.
 * Sem sessão → `UnauthorizedError`; sessão de cliente → `ForbiddenError`.
 */
export async function requireAdmin(): Promise<SessionPayload> {
    const session = await requireSession();

    if (session.role !== "ADMIN") {
        throw new ForbiddenError();
    }

    return session;
}
