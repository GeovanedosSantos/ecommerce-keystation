import { randomUUID } from "node:crypto";
import type { OrderStatus } from "@/generated/prisma/enums";
import { searchCatalog } from "@/core/modules/catalog/service";
import { parseCatalogQuery, type SearchParamsInput } from "@/core/modules/catalog/schema";
import { createProduct } from "@/core/modules/product/service";
import { prisma } from "@/infra/prisma";

/** Instante fixo das buscas, para as promoções não dependerem do relógio. */
export const NOW = new Date("2026-06-15T12:00:00Z");
export const DAY = 24 * 60 * 60 * 1000;

export const search = (params: SearchParamsInput = {}) =>
    searchCatalog(parseCatalogQuery(params), NOW);

/** Títulos do resultado, na ordem da página. */
export const titlesOf = async (params: SearchParamsInput = {}) =>
    (await search(params)).items.map(({ title }) => title);

export const createPlatform = (name: string) => prisma.platform.create({ data: { name } });
export const createGenre = (name: string) => prisma.genre.create({ data: { name } });

type VariantInput = {
    platformId: string;
    price: number;
    releaseDate?: string;
    status?: "PUBLISHED" | "DISABLED";
};

type GameInput = {
    title: string;
    variants: VariantInput[];
    developer?: string;
    category?: "GAME" | "DLC" | "SPECIAL_EDITION";
    baseProductId?: string;
    genreIds?: string[];
};

/** Cria o produto pelo service (que grava a busca) e devolve os ids das variants por plataforma. */
export async function createGame({ variants, category = "GAME", ...fields }: GameInput) {
    const product = await createProduct({
        ...fields,
        category,
        description: "Descrição",
        variants: variants.map(
            ({ releaseDate = "2026-01-01", status = "PUBLISHED", ...variant }) => ({
                ...variant,
                releaseDate,
                status,
            }),
        ),
    });

    return {
        id: product.id,
        variantId: (platformId: string) => {
            const variant = product.variants.find((item) => item.platformId === platformId);
            if (!variant) throw new Error(`Variant de ${platformId} não criada`);
            return variant.id;
        },
    };
}

type PromotionWindow = { isActive?: boolean; startsAt?: Date; endsAt?: Date };

export function createPromotion(
    variantId: string,
    discountPercent: number,
    {
        isActive = true,
        startsAt = new Date(NOW.getTime() - DAY),
        endsAt = new Date(NOW.getTime() + DAY),
    }: PromotionWindow = {},
) {
    return prisma.promotion.create({
        data: {
            name: `Promoção ${discountPercent}%`,
            isActive,
            startsAt,
            endsAt,
            products: { create: { variantId, discountPercent } },
        },
    });
}

export const addKey = (variantId: string) =>
    prisma.key.create({ data: { variantId, keyCode: randomUUID() } });

/** Cria `quantity` pedidos com um item da variant cada. */
export async function sell(variantId: string, quantity: number, status: OrderStatus = "PAID") {
    const user = await prisma.user.create({
        data: {
            email: `${randomUUID()}@teste.com`,
            passwordHash: "hash",
            firstName: "Cliente",
            lastName: "Teste",
        },
    });

    for (let index = 0; index < quantity; index++) {
        await prisma.order.create({
            data: {
                number: randomUUID().slice(0, 20),
                status,
                subtotal: 10,
                total: 10,
                userId: user.id,
                items: { create: { variantId, originalPrice: 10, paidPrice: 10 } },
            },
        });
    }
}
