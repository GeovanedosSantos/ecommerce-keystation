import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockVerifySessionToken = vi.fn();

vi.mock("@/core/modules/auth/session", () => ({
  SESSION_COOKIE_NAME: "keystation_session",
  verifySessionToken: (...args: unknown[]) => mockVerifySessionToken(...args),
}));

import { proxy } from "./proxy";

function buildRequest(path: string, token?: string) {
  const headers = token ? { cookie: `keystation_session=${token}` } : undefined;
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

beforeEach(() => {
  mockVerifySessionToken.mockReset();
});

describe("proxy - proteção de rotas administrativas", () => {
  it.each(["/admin", "/admin/games", "/admin/games/new", "/admin/orders"])(
    "redireciona visitante sem sessão em %s para /login",
    async (path) => {
      mockVerifySessionToken.mockResolvedValueOnce(null);

      const response = await proxy(buildRequest(path));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    },
  );

  it.each(["/admin", "/admin/games", "/admin/games/new", "/admin/orders"])(
    "redireciona usuário CUSTOMER em %s para a home",
    async (path) => {
      mockVerifySessionToken.mockResolvedValueOnce({
        userId: "user-1",
        role: "CUSTOMER",
      });

      const response = await proxy(buildRequest(path, "token-customer"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    },
  );

  it.each(["/admin", "/admin/games", "/admin/games/new", "/admin/orders"])(
    "permite usuário ADMIN acessar %s",
    async (path) => {
      mockVerifySessionToken.mockResolvedValueOnce({
        userId: "admin-1",
        role: "ADMIN",
      });

      const response = await proxy(buildRequest(path, "token-admin"));

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it("retorna 401 JSON em /api/admin/upload sem sessão", async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);

    const response = await proxy(buildRequest("/api/admin/upload"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Autenticação necessária" });
  });

  it("retorna 403 JSON em /api/admin/upload para CUSTOMER", async () => {
    mockVerifySessionToken.mockResolvedValueOnce({
      userId: "user-1",
      role: "CUSTOMER",
    });

    const response = await proxy(buildRequest("/api/admin/upload", "token-customer"));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Acesso negado" });
  });

  it("permite ADMIN acessar /api/admin/upload", async () => {
    mockVerifySessionToken.mockResolvedValueOnce({
      userId: "admin-1",
      role: "ADMIN",
    });

    const response = await proxy(buildRequest("/api/admin/upload", "token-admin"));

    expect(response.status).toBe(200);
  });
});
