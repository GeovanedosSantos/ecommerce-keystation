import { z } from "zod";
import { Category, ProductStatus } from "@/generated/prisma/enums";
import { slugify } from "./slugify";

const quantitySchema = z.strictObject({
    value: z.number().positive(),
    unit: z.enum(["GB", "MB"]),
});

const requirementsBlockSchema = z.strictObject({
    processor: z.string().trim().min(1),
    ram: quantitySchema,
    disk_space: quantitySchema,
});

const toMB = ({ value, unit }: z.infer<typeof quantitySchema>) =>
    unit === "GB" ? value * 1024 : value;

const systemRequirementsSchema = z
    .strictObject({ minimum: requirementsBlockSchema, recommended: requirementsBlockSchema })
    .superRefine(({ minimum, recommended }, ctx) => {
        for (const field of ["ram", "disk_space"] as const) {
            if (toMB(minimum[field]) > toMB(recommended[field])) {
                ctx.addIssue({
                    code: "custom",
                    path: ["recommended", field],
                    message: `recommended.${field} deve ser maior ou igual a minimum.${field}`,
                });
            }
        }
    });

const variantFields = {
    price: z
        .number()
        .positive()
        .max(99_999_999.99)
        .refine(
            // Aceita o sinal: preço negativo já é recusado pelo `positive()` acima.
            (price) => /^-?\d+(\.\d{1,2})?$/.test(String(price)),
            "O preço deve ter no máximo 2 casas decimais",
        ),
    status: z.enum(ProductStatus),
    releaseDate: z.iso.date().transform((date) => new Date(date)),
};

const atLeastOneField = (data: object) => Object.keys(data).length > 0;
const atLeastOneFieldMessage = "Informe ao menos um campo para atualizar";

export const variantSchema = z.strictObject({
    ...variantFields,
    platformId: z.uuid(),
    status: variantFields.status.optional(),
});

/** Atualização parcial. A plataforma de uma variant não pode ser trocada. */
export const updateVariantSchema = z
    .strictObject(variantFields)
    .partial()
    .refine(atLeastOneField, atLeastOneFieldMessage);

const isHttpsUrl = (value: string) => {
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

/** Caminho relativo ao site (ex: `/images/capa.jpg`) ou URL `https://`. */
const assetPathSchema = z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine(
        (value) => /^\/(?!\/)[\w\-./%]+$/.test(value) || isHttpsUrl(value),
        "Informe um caminho relativo (começando com /) ou uma URL https://",
    );

const galleryItemSchema = z.strictObject({
    path: assetPathSchema,
    position: z.int().min(0).max(32_767),
});

function uniqueBy<T, K extends keyof T>(key: K, message: (value: T[K]) => string) {
    return (items: T[], ctx: z.RefinementCtx) => {
        items.forEach((item, index) => {
            if (items.findIndex((other) => other[key] === item[key]) !== index) {
                ctx.addIssue({
                    code: "custom",
                    path: [index, key as string],
                    message: message(item[key]),
                });
            }
        });
    };
}

const optionalText = (max: number) => z.string().trim().min(1).max(max).nullish();

const slugSchema = z
    .string()
    .trim()
    .max(255)
    .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "O slug deve conter apenas letras minúsculas, números e hífens (ex: resident-evil-4-2005)",
    );

/** Campos do produto compartilhados entre criação e atualização (sem defaults). */
const productFields = {
    category: z.enum(Category),
    title: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine(
            (title) => slugify(title).length > 0,
            "O título precisa ter ao menos uma letra ou número",
        ),
    slug: slugSchema,
    description: z.string().trim().min(1),
    developer: optionalText(150),
    publisher: optionalText(150),
    coverPath: assetPathSchema.nullish(),
    trailerYoutubeId: z
        .string()
        .regex(/^[A-Za-z0-9_-]{11}$/, "ID de vídeo do YouTube inválido")
        .nullish(),
    baseProductId: z.uuid().nullish(),
    systemRequirements: systemRequirementsSchema.nullish(),
    genreIds: z.array(z.uuid()).transform((ids) => [...new Set(ids)]),
    gallery: z
        .array(galleryItemSchema)
        .superRefine(uniqueBy("position", (position) => `Posição ${position} repetida na galeria`)),
};

/**
 * Atualização parcial: só os campos enviados são alterados. `genreIds` e `gallery`,
 * quando enviados, substituem a lista inteira. Variants têm endpoint próprio.
 */
export const updateProductSchema = z
    .strictObject(productFields)
    .partial()
    .refine(atLeastOneField, atLeastOneFieldMessage);

export const createProductSchema = z
    .strictObject({
        ...productFields,
        slug: slugSchema.optional(),
        variants: z
            .array(variantSchema)
            .superRefine(uniqueBy("platformId", (id) => `Plataforma "${id}" repetida em variants`))
            .default([]),
        genreIds: productFields.genreIds.default([]),
        gallery: productFields.gallery.default([]),
    })
    // A regra GAME x baseProductId fica no service (assertCategoryBase), igual para create e update.
    .transform((product) => ({ ...product, slug: product.slug ?? slugify(product.title) }));
