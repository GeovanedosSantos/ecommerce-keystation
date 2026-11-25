import { Category, Prisma } from "@/generated/prisma/client";
import { KeyStatus, ProductStatus } from "@/generated/prisma/enums";
import { prisma } from "@/infra/prisma";
import { expireStaleOrders } from "@/core/modules/order/expiration";
import {
    ConflictError,
    NotFoundError,
    parseOrThrow,
    UnprocessableEntityError,
} from "@/core/errors";
import { z } from "zod";
import {
    createProductSchema,
    updateProductSchema,
    updateVariantSchema,
    variantSchema,
} from "./schema";
import { productSearchFields } from "./search-fields";
import {
    editionSelect,
    productWithVariantsInclude,
    publishedProductInclude,
    variantWithPlatformInclude,
    type AdminProductDetail,
    type AdminProductListItem,
    type CatalogOptions,
    type ProductEdition,
    type ProductWithVariants,
    type PublishedProduct,
    type UpdateProductInput,
    type VariantAvailability,
    type VariantWithPlatform,
} from "./types";

const productNotFound = (slug: string) => new NotFoundError(`Produto "${slug}" não encontrado`);

const hasAddons = (slug: string) =>
    `O produto "${slug}" é base de outros produtos (DLCs ou edições especiais)`;

export async function createProduct(payload: unknown): Promise<ProductWithVariants> {
    const { systemRequirements, variants, genreIds, gallery, ...fields } = parseOrThrow(
        createProductSchema,
        payload,
    );

    assertCategoryBase(fields.category, fields.baseProductId);

    await validateReferences({
        slug: fields.slug,
        baseProductId: fields.baseProductId,
        genreIds,
        platformIds: variants.map((variant) => variant.platformId),
    });

    return prisma.product.create({
        data: {
            ...fields,
            ...productSearchFields(fields.title, fields.developer),
            systemRequirements: systemRequirements ?? undefined,
            variants: {
                create: variants.map((variant) => ({
                    ...variant,
                    price: variant.price.toFixed(2),
                })),
            },
            genres: { connect: genreIds.map((id) => ({ id })) },
            gallery: { create: gallery },
        },
        include: productWithVariantsInclude,
    });
}

/**
 * Vitrine pública: retorna o produto só com as variants PUBLISHED. Produto sem nenhuma
 * variant publicada é tratado como inexistente.
 */
export async function getPublishedProductBySlug(slug: string): Promise<PublishedProduct> {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: publishedProductInclude,
    });

    if (!product || product.variants.length === 0) {
        throw productNotFound(slug);
    }

    return product;
}

/** Preço, maior desconto ativo em `now` e estoque. Variants inexistentes ou despublicadas não voltam. */
export async function getVariantsAvailability(
    variantIds: string[],
    now: Date = new Date(),
): Promise<VariantAvailability[]> {
    if (variantIds.length === 0) {
        return [];
    }

    const [variants, inStockIds] = await Promise.all([
        prisma.productVariant.findMany({
            where: { id: { in: variantIds }, status: ProductStatus.PUBLISHED },
            select: {
                id: true,
                price: true,
                promotions: {
                    where: {
                        promotion: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
                    },
                    orderBy: { discountPercent: "desc" },
                    take: 1,
                    select: { discountPercent: true },
                },
            },
        }),
        variantIdsInStock(variantIds),
    ]);

    return variants.map(({ id, price, promotions }) => ({
        variantId: id,
        price,
        discountPercent: promotions[0]?.discountPercent ?? null,
        inStock: inStockIds.has(id),
    }));
}

export async function getPublishedEditions(
    product: Pick<PublishedProduct, "id" | "category" | "baseProductId">,
): Promise<ProductEdition[]> {
    if (product.category === Category.DLC) {
        return [];
    }

    // Numa edição especial, a família é a do jogo base; no jogo base, é ele mesmo.
    const baseId = product.baseProductId ?? product.id;

    return prisma.product.findMany({
        where: {
            id: { not: product.id },
            OR: [{ id: baseId }, { baseProductId: baseId, category: Category.SPECIAL_EDITION }],
            variants: { some: { status: ProductStatus.PUBLISHED } },
        },
        // A ordem do enum no Postgres é GAME, DLC, SPECIAL_EDITION: o jogo base vem primeiro.
        orderBy: [{ category: "asc" }, { title: "asc" }],
        select: editionSelect,
    });
}

// `take: 1` aninhado num findMany de várias variants não vira LIMIT no SQL; findFirst por variant vira.
async function variantIdsInStock(variantIds: string[]): Promise<Set<string>> {
    await expireStaleOrders();
    const keys = await Promise.all(
        variantIds.map((variantId) =>
            prisma.key.findFirst({
                where: { variantId, status: KeyStatus.AVAILABLE },
                select: { variantId: true },
            }),
        ),
    );

    return new Set(keys.flatMap((key) => (key ? [key.variantId] : [])));
}

const currentProductSelect = {
    id: true,
    slug: true,
    title: true,
    developer: true,
    category: true,
    baseProductId: true,
    _count: { select: { addons: true } },
} satisfies Prisma.ProductSelect;

type CurrentProduct = Prisma.ProductGetPayload<{ select: typeof currentProductSelect }>;

export async function updateProduct(slug: string, payload: unknown): Promise<ProductWithVariants> {
    const data = parseOrThrow(updateProductSchema, payload);

    const current = await prisma.product.findUnique({
        where: { slug },
        select: currentProductSelect,
    });

    if (!current) {
        throw productNotFound(slug);
    }

    await validateUpdate(current, data);

    const { systemRequirements, genreIds, gallery, ...fields } = data;
    const searchChanged = fields.title !== undefined || fields.developer !== undefined;

    return prisma.product.update({
        where: { id: current.id },
        data: {
            ...fields,
            ...(searchChanged &&
                productSearchFields(
                    fields.title ?? current.title,
                    fields.developer === undefined ? current.developer : fields.developer,
                )),
            systemRequirements: systemRequirements === null ? Prisma.DbNull : systemRequirements,
            genres: genreIds && { set: genreIds.map((id) => ({ id })) },
            gallery: gallery && { deleteMany: {}, create: gallery },
        },
        include: productWithVariantsInclude,
    });
}

/**
 * Exclui o produto e suas variants. Recusa (409) se o produto for base de outros
 * ou se alguma variant tiver chaves ou pedidos — nesses casos o caminho é desativar.
 */
export async function deleteProduct(slug: string): Promise<void> {
    const product = await prisma.product.findUnique({
        where: { slug },
        select: {
            id: true,
            _count: { select: { addons: true } },
            variants: { select: { _count: { select: { keys: true, orderItems: true } } } },
        },
    });

    if (!product) {
        throw productNotFound(slug);
    }

    if (product._count.addons > 0) {
        throw new ConflictError(`${hasAddons(slug)} e não pode ser excluído`);
    }

    if (product.variants.some(({ _count }) => isInUse(_count))) {
        throw new ConflictError(
            `O produto "${slug}" não pode ser excluído porque tem variants com chaves ou pedidos vinculados. ` +
                "Para tirá-lo da loja, altere o status das variants para DISABLED",
        );
    }

    await prisma.$transaction([
        prisma.productVariant.deleteMany({ where: { productId: product.id } }),
        prisma.product.delete({ where: { id: product.id } }),
    ]);
}

export async function createVariant(slug: string, payload: unknown): Promise<VariantWithPlatform> {
    const { platformId, price, ...fields } = parseOrThrow(variantSchema, payload);

    // Busca o produto já trazendo a variant da mesma plataforma, se existir.
    const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true, variants: { where: { platformId }, select: { id: true } } },
    });

    if (!product) {
        throw productNotFound(slug);
    }

    if (product.variants.length > 0) {
        throw new ConflictError(`O produto "${slug}" já possui uma variant para esta plataforma`);
    }

    await validateReferences({ platformIds: [platformId] });

    return prisma.productVariant.create({
        data: { ...fields, productId: product.id, platformId, price: price.toFixed(2) },
        include: variantWithPlatformInclude,
    });
}

export async function updateVariant(
    slug: string,
    variantId: string,
    payload: unknown,
): Promise<VariantWithPlatform> {
    const { price, ...fields } = parseOrThrow(updateVariantSchema, payload);
    const variant = await findVariant(slug, variantId);

    return prisma.productVariant.update({
        where: { id: variant.id },
        data: { ...fields, price: price?.toFixed(2) },
        include: variantWithPlatformInclude,
    });
}

export async function deleteVariant(slug: string, variantId: string): Promise<void> {
    const variant = await findVariant(slug, variantId);

    if (isInUse(variant._count)) {
        throw new ConflictError(
            "A variant não pode ser excluída porque tem chaves ou pedidos vinculados. " +
                "Para tirá-la da loja, altere o status para DISABLED",
        );
    }

    await prisma.productVariant.delete({ where: { id: variant.id } });
}

/** Variant com chaves ou pedidos não pode ser excluída, só desativada. */
const isInUse = (count: { keys: number; orderItems: number }) =>
    count.keys > 0 || count.orderItems > 0;

/** Busca a variant garantindo que ela pertence ao produto do slug. */
async function findVariant(slug: string, variantId: string) {
    const variant = z.uuid().safeParse(variantId).success
        ? await prisma.productVariant.findFirst({
              where: { id: variantId, product: { slug } },
              select: { id: true, _count: { select: { keys: true, orderItems: true } } },
          })
        : null;

    if (!variant) {
        throw new NotFoundError(`Variant não encontrada no produto "${slug}"`);
    }

    return variant;
}

/** GAME não tem produto base; as outras categorias (DLC, edições) precisam de um. */
function assertCategoryBase(category: Category, baseProductId: string | null | undefined) {
    const isGame = category === Category.GAME;

    if (isGame && baseProductId) {
        throw new UnprocessableEntityError(
            "Um produto da categoria GAME não pode ter baseProductId (envie baseProductId: null)",
        );
    }

    if (!isGame && !baseProductId) {
        throw new UnprocessableEntityError(
            `baseProductId é obrigatório para a categoria ${category}`,
        );
    }
}

/** Valida o estado final do produto (atual + alterações) e as referências que mudaram. */
async function validateUpdate(current: CurrentProduct, data: UpdateProductInput) {
    const category = data.category ?? current.category;
    const baseProductId =
        data.baseProductId === undefined ? current.baseProductId : data.baseProductId;

    assertCategoryBase(category, baseProductId);

    if (category !== Category.GAME && current._count.addons > 0) {
        throw new UnprocessableEntityError(
            `${hasAddons(current.slug)} e precisa continuar na categoria GAME`,
        );
    }

    if (baseProductId === current.id) {
        throw new UnprocessableEntityError("Um produto não pode ser base dele mesmo");
    }

    // Só consulta o banco para o que de fato mudou.
    await validateReferences({
        slug: data.slug !== current.slug ? data.slug : undefined,
        baseProductId:
            data.baseProductId !== current.baseProductId ? data.baseProductId : undefined,
        genreIds: data.genreIds,
    });
}

type References = {
    /** Slug que precisa estar livre. */
    slug?: string | null;
    /** Produto base: precisa existir e ser GAME. */
    baseProductId?: string | null;
    genreIds?: string[];
    platformIds?: string[];
};

const byIds = (ids: string[]) => ({ where: { id: { in: ids } }, select: { id: true } });

/** Confere no banco as referências informadas. Campos ausentes não são consultados. */
async function validateReferences({
    slug,
    baseProductId,
    genreIds = [],
    platformIds = [],
}: References) {
    const [slugOwner, base, genres, platforms] = await Promise.all([
        slug ? prisma.product.findUnique({ where: { slug }, select: { id: true } }) : null,
        baseProductId
            ? prisma.product.findUnique({
                  where: { id: baseProductId },
                  select: { category: true },
              })
            : null,
        genreIds.length > 0 ? prisma.genre.findMany(byIds(genreIds)) : [],
        platformIds.length > 0 ? prisma.platform.findMany(byIds(platformIds)) : [],
    ]);

    if (slug && slugOwner) {
        throw new ConflictError(
            `Já existe um produto com o slug "${slug}". Envie um "slug" diferente no payload`,
        );
    }

    if (baseProductId && !base) {
        throw new UnprocessableEntityError(`Produto base não encontrado: ${baseProductId}`);
    }

    if (base && base.category !== Category.GAME) {
        throw new UnprocessableEntityError(
            `O produto base precisa ser da categoria GAME (recebido: ${base.category})`,
        );
    }

    assertAllFound(platformIds, platforms, "Plataforma(s) não encontrada(s)");
    assertAllFound(genreIds, genres, "Gênero(s) não encontrado(s)");
}

function assertAllFound(requested: string[], found: { id: string }[], message: string) {
    const foundIds = new Set(found.map(({ id }) => id));
    const missing = requested.filter((id) => !foundIds.has(id));

    if (missing.length > 0) {
        throw new UnprocessableEntityError(`${message}: ${missing.join(", ")}`);
    }
}

/** Lista produtos para o painel administrativo (inclui variants DISABLED e contagem de chaves). */
export async function listAdminProducts(search?: string): Promise<AdminProductListItem[]> {
    const term = search?.trim();
    const products = await prisma.product.findMany({
        where: term
            ? {
                  OR: [
                      { title: { contains: term, mode: "insensitive" } },
                      { developer: { contains: term, mode: "insensitive" } },
                      { slug: { contains: term, mode: "insensitive" } },
                  ],
              }
            : undefined,
        orderBy: { createdAt: "desc" },
        include: {
            genres: { select: { id: true, name: true }, orderBy: { name: "asc" } },
            variants: {
                include: {
                    platform: { select: { id: true, name: true } },
                    keys: { select: { status: true } },
                },
                orderBy: { platform: { name: "asc" } },
            },
        },
    });

    return products.map((product) => ({
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        developer: product.developer,
        coverPath: product.coverPath,
        genres: product.genres,
        variants: product.variants.map((variant) => ({
            id: variant.id,
            platformId: variant.platformId,
            platformName: variant.platform.name,
            price: Number(variant.price),
            status: variant.status,
            releaseDate: variant.releaseDate.toISOString().slice(0, 10),
            availableKeys: variant.keys.filter((k) => k.status === KeyStatus.AVAILABLE).length,
            totalKeys: variant.keys.length,
        })),
    }));
}

/** Busca um produto completo para edição no painel administrativo. */
export async function getAdminProductBySlug(slug: string): Promise<AdminProductDetail> {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            genres: { select: { id: true, name: true }, orderBy: { name: "asc" } },
            gallery: { orderBy: { position: "asc" }, select: { path: true, position: true } },
            variants: {
                include: {
                    platform: { select: { id: true, name: true } },
                    keys: { select: { status: true } },
                },
                orderBy: { platform: { name: "asc" } },
            },
        },
    });

    if (!product) {
        throw productNotFound(slug);
    }

    return {
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        description: product.description,
        developer: product.developer,
        publisher: product.publisher,
        coverPath: product.coverPath,
        baseProductId: product.baseProductId,
        genres: product.genres,
        gallery: product.gallery,
        variants: product.variants.map((variant) => {
            const available = variant.keys.filter((k) => k.status === KeyStatus.AVAILABLE).length;
            const reserved = variant.keys.filter((k) => k.status === KeyStatus.RESERVED).length;
            const sold = variant.keys.filter(
                (k) => k.status === KeyStatus.SOLD || k.status === KeyStatus.REVEALED,
            ).length;

            return {
                id: variant.id,
                platformId: variant.platformId,
                platformName: variant.platform.name,
                price: Number(variant.price),
                status: variant.status,
                releaseDate: variant.releaseDate.toISOString().slice(0, 10),
                availableKeys: available,
                totalKeys: variant.keys.length,
                keyStats: { available, reserved, sold },
            };
        }),
    };
}

/** Carrega gêneros, plataformas e jogos base para popular os selects do formulário. */
export async function listCatalogOptions(): Promise<CatalogOptions> {
    const [genres, platforms, baseGames] = await Promise.all([
        prisma.genre.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
        prisma.platform.findMany({
            select: { id: true, name: true, hasSystemRequirements: true },
            orderBy: { name: "asc" },
        }),
        prisma.product.findMany({
            where: { category: Category.GAME },
            select: { id: true, title: true, slug: true },
            orderBy: { title: "asc" },
        }),
    ]);

    return { genres, platforms, baseGames };
}
