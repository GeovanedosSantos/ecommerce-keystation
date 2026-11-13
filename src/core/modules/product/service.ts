import { Category, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/infra/prisma";
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
import {
    productWithVariantsInclude,
    publishedProductInclude,
    variantWithPlatformInclude,
    type ProductWithVariants,
    type PublishedProduct,
    type UpdateProductInput,
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
 * Vitrine pública: retorna só as variants PUBLISHED. Produto sem nenhuma variant
 * publicada é tratado como inexistente. Variant publicada sem chaves AVAILABLE
 * continua visível, mas com `inStock: false` (esgotada).
 */
export async function getPublishedProductBySlug(slug: string): Promise<PublishedProduct> {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: publishedProductInclude,
    });

    if (!product || product.variants.length === 0) {
        throw productNotFound(slug);
    }

    return {
        ...product,
        variants: product.variants.map(({ _count, ...variant }) => ({
            ...variant,
            inStock: _count.keys > 0,
        })),
    };
}

const currentProductSelect = {
    id: true,
    slug: true,
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

    return prisma.product.update({
        where: { id: current.id },
        data: {
            ...fields,
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
