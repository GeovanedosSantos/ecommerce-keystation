import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Category, Prisma, PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "@/core/modules/auth/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/*
 * Dados iguais aos do mock da vitrine (src/utils/mock/games.ts), para a troca do mock
 * pelo banco não mudar nada na tela.
 */

const GENRES = ["Ação", "RPG", "Mundo Aberto", "Soulslike", "Corrida", "Estratégia", "Indie"];

/** Plataformas da loja. Só PC (Steam) tem requisitos de sistema. */
const PLATFORMS = [
  { name: "Steam", hasSystemRequirements: true, keySuffix: "DEVKS" },
  { name: "PlayStation", hasSystemRequirements: false, keySuffix: "DEVPS" },
  { name: "Xbox", hasSystemRequirements: false, keySuffix: "DEVXB" },
] as const;

type PlatformName = (typeof PLATFORMS)[number]["name"];

type Quantity = { value: number; unit: "GB" | "MB" };

type RequirementsBlock = {
  os: string;
  processor: string;
  ram: Quantity;
  gpu: string;
  disk_space: Quantity;
};

type SystemRequirements = { minimum: RequirementsBlock; recommended: RequirementsBlock };

type SeedVariant = {
  platform: PlatformName;
  price: string;
  /** Desconto da promoção "Ofertas da Semana" (1 a 99), ou null sem promoção. */
  discountPercent: number | null;
  releaseDate: string;
  /** Chaves disponíveis; 0 deixa a variant esgotada. */
  keys: number;
};

type SeedProduct = {
  slug: string;
  title: string;
  category: Category;
  /** Slug do jogo base (obrigatório para DLC e edições especiais). Precisa vir antes na lista. */
  baseSlug?: string;
  developer: string;
  publisher: string;
  coverPath: string;
  trailerYoutubeId: string | null;
  /** Parágrafos separados por linha em branco. */
  description: string;
  genres: string[];
  /** URLs das imagens da galeria, na ordem de exibição. */
  gallery: string[];
  systemRequirements: SystemRequirements | null;
  keyPrefix: string;
  variants: SeedVariant[];
};

/** Capsules (616x353) e screenshots (1920x1080) da loja Steam. */
const steam = (appId: number, file: string) =>
  `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${file}`;

/** Screenshots do IGDB (1920x1080), para jogos fora da Steam. */
const igdb = (imageId: string) => `https://images.igdb.com/igdb/image/upload/t_1080p/${imageId}.jpg`;

const gb = (value: number): Quantity => ({ value, unit: "GB" });

const CYBERPUNK_GALLERY = [
  steam(1091500, "ss_2f649b68d579bf87011487d29bc4ccbfdd97d34f.1920x1080.jpg"),
  steam(1091500, "900f9bda156599fcd235f08ffb64667f9baa1afe/ss_900f9bda156599fcd235f08ffb64667f9baa1afe.1920x1080.jpg"),
  steam(1091500, "f678ed77c2fe7060ac9c64e32e1472e3ec3ab7dc/ss_f678ed77c2fe7060ac9c64e32e1472e3ec3ab7dc.1920x1080.jpg"),
  steam(1091500, "0ed9487e305983d60646ba163a3d8970efb6b347/ss_0ed9487e305983d60646ba163a3d8970efb6b347.1920x1080.jpg"),
];

const CYBERPUNK_REQUIREMENTS: SystemRequirements = {
  minimum: {
    os: "Windows 10 64 bits",
    processor: "Intel i7-6700 / AMD Ryzen 5 1600",
    ram: gb(12),
    gpu: "GTX 1060 6 GB / RX 580 8 GB",
    disk_space: gb(70),
  },
  recommended: {
    os: "Windows 10 64 bits",
    processor: "Intel i7-12700 / AMD Ryzen 7 7800X3D",
    ram: gb(16),
    gpu: "RTX 2060 SUPER / RX 5700 XT",
    disk_space: gb(70),
  },
};

const PRODUCTS: SeedProduct[] = [
  {
    slug: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    category: Category.GAME,
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT",
    coverPath: steam(1091500, "capsule_616x353.jpg"),
    trailerYoutubeId: "8X2kIfS6fb8",
    description:
      "Cyberpunk 2077 é um RPG de ação e aventura em mundo aberto que se passa em Night City, uma megalópole perigosa onde todos são obcecados por poder, glamour e modificações corporais.\n\nJogue como V, um mercenário fora da lei em busca de um implante único que é a chave para a imortalidade. Personalize o cyberware, as habilidades e o estilo de jogo do seu personagem e explore uma cidade enorme, onde cada escolha muda a história e o mundo ao seu redor.",
    genres: ["Ação", "RPG"],
    gallery: CYBERPUNK_GALLERY,
    systemRequirements: CYBERPUNK_REQUIREMENTS,
    keyPrefix: "CP77B",
    variants: [
      { platform: "Steam", price: "129.90", discountPercent: null, releaseDate: "2020-12-10", keys: 5 },
    ],
  },
  {
    slug: "cyberpunk-2077-ultimate-edition",
    title: "Cyberpunk 2077: Ultimate Edition",
    category: Category.SPECIAL_EDITION,
    baseSlug: "cyberpunk-2077",
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT",
    // Pacote na Steam, sem capsule: capa recortada em 616:353 e servida de public/.
    coverPath: "/covers/cyberpunk-2077-ultimate-edition.jpg",
    trailerYoutubeId: "Ugb80d5lxEM",
    description:
      "A Ultimate Edition reúne o jogo base Cyberpunk 2077 e a expansão Phantom Liberty em um único pacote, com todas as melhorias da atualização 2.0.\n\nEm Phantom Liberty, V entra em uma trama de espionagem em Dogtown, um novo distrito de Night City, ao lado do agente Solomon Reed, para resgatar a presidente da Nova União Americana. Novas habilidades, armas, implantes e veículos completam a experiência.",
    genres: ["Ação", "RPG"],
    gallery: CYBERPUNK_GALLERY,
    systemRequirements: CYBERPUNK_REQUIREMENTS,
    keyPrefix: "CP77X",
    variants: [
      { platform: "Steam", price: "199.99", discountPercent: 50, releaseDate: "2023-12-05", keys: 5 },
    ],
  },
  {
    slug: "elden-ring",
    title: "Elden Ring",
    category: Category.GAME,
    developer: "FromSoftware",
    publisher: "Bandai Namco Entertainment",
    coverPath: steam(1245620, "capsule_616x353.jpg"),
    trailerYoutubeId: "E3Huy2cdih0",
    description:
      "Levante-se, Maculado, e seja guiado pela graça para portar o poder do Anel Prístino e se tornar um Lorde Prístino nas Terras Intermédias.\n\nExplore um vasto mundo aberto cheio de masmorras, segredos e chefes desafiadores, e crie o seu personagem combinando armas, armaduras e magias do seu jeito.",
    genres: ["Ação", "RPG", "Soulslike"],
    gallery: [
      steam(1245620, "ss_943bf6fe62352757d9070c1d33e50b92fe8539f1.1920x1080.jpg"),
      steam(1245620, "ss_dcdac9e4b26ac0ee5248bfd2967d764fd00cdb42.1920x1080.jpg"),
      steam(1245620, "ss_3c41384a24d86dddd58a8f61db77f9dc0bfda8b5.1920x1080.jpg"),
      steam(1245620, "ss_e0316c76f8197405c1312d072b84331dd735d60b.1920x1080.jpg"),
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10/11 64 bits",
        processor: "Intel Core i5-8400 / AMD Ryzen 3 3300X",
        ram: gb(12),
        gpu: "GTX 1060 3 GB / RX 580 4 GB",
        disk_space: gb(60),
      },
      recommended: {
        os: "Windows 10/11 64 bits",
        processor: "Intel Core i7-8700K / AMD Ryzen 5 3600X",
        ram: gb(16),
        gpu: "GTX 1070 8 GB / RX Vega 56 8 GB",
        disk_space: gb(60),
      },
    },
    keyPrefix: "ELDRN",
    variants: [
      { platform: "Steam", price: "229.90", discountPercent: 22, releaseDate: "2022-02-25", keys: 5 },
    ],
  },
  {
    slug: "grand-theft-auto-vi",
    title: "Grand Theft Auto VI",
    category: Category.GAME,
    developer: "Rockstar North",
    publisher: "Rockstar Games",
    // Fora da Steam: capa gerada na proporção da capsule e servida de public/.
    coverPath: "/covers/grand-theft-auto-vi.jpg",
    trailerYoutubeId: "3JUboYgqIxc",
    description:
      "Retorne a Vice City e arredores no próximo capítulo da série Grand Theft Auto. Crimes, reviravoltas e um mundo aberto em escala inédita aguardam em uma história de ambição e traição.",
    genres: ["Ação", "Mundo Aberto"],
    gallery: [igdb("scwpqj"), igdb("sc166fv"), igdb("sc10vlm")],
    // Sem versão de PC: só consoles, sem requisitos de sistema.
    systemRequirements: null,
    keyPrefix: "GTA6X",
    variants: [
      { platform: "PlayStation", price: "299.99", discountPercent: null, releaseDate: "2026-11-19", keys: 5 },
      { platform: "Xbox", price: "299.99", discountPercent: null, releaseDate: "2026-11-19", keys: 0 },
    ],
  },
  {
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    category: Category.GAME,
    developer: "Larian Studios",
    publisher: "Larian Studios",
    coverPath: steam(1086940, "capsule_616x353.jpg"),
    trailerYoutubeId: "1T22wNvoNiU",
    description:
      "Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de companheirismo e traição, sacrifício e sobrevivência, e a sedução do poder absoluto.\n\nBaseado nas regras de Dungeons & Dragons, cada escolha, diálogo e rolagem de dado muda o rumo da aventura, sozinho ou em cooperativo.",
    genres: ["RPG", "Estratégia"],
    gallery: [
      steam(1086940, "ss_c73bc54415178c07fef85f54ee26621728c77504.1920x1080.jpg"),
      steam(1086940, "ss_73d93bea842b93914d966622104dcb8c0f42972b.1920x1080.jpg"),
      steam(1086940, "ss_cf936d31061b58e98e0c646aee00e6030c410cda.1920x1080.jpg"),
      steam(1086940, "ss_b6a6ee6e046426d08ceea7a4506a1b5f44181543.1920x1080.jpg"),
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64 bits",
        processor: "Intel i5-4690 / AMD FX 4350",
        ram: gb(8),
        gpu: "GTX 970 / RX 480 4 GB",
        disk_space: gb(150),
      },
      recommended: {
        os: "Windows 10 64 bits",
        processor: "Intel i7-8700K / AMD Ryzen 5 3600",
        ram: gb(16),
        gpu: "RTX 2060 SUPER / RX 5700 XT",
        disk_space: gb(150),
      },
    },
    keyPrefix: "BG3XX",
    // Esgotado no mock: variant publicada sem chaves disponíveis.
    variants: [
      { platform: "Steam", price: "199.99", discountPercent: 25, releaseDate: "2023-08-03", keys: 0 },
    ],
  },
  {
    slug: "black-myth-wukong",
    title: "Black Myth: Wukong",
    category: Category.GAME,
    developer: "Game Science",
    publisher: "Game Science",
    coverPath: steam(2358720, "capsule_616x353.jpg"),
    trailerYoutubeId: "bzyMLoSwYvk",
    description:
      "Inspirado no clássico chinês Jornada ao Oeste, este RPG de ação acompanha o Destinado em uma jornada repleta de mitos, criaturas lendárias e chefes memoráveis.\n\nCombate rápido, transformações e magias criam um desafio visualmente impressionante.",
    genres: ["Ação"],
    gallery: [
      steam(2358720, "ss_86c4b7462bba219a0d0b89931a35812b9f188976.1920x1080.jpg"),
      steam(2358720, "ss_d9391ab31a4d15dddf7ba4949bfa44f5d9170580.1920x1080.jpg"),
      steam(2358720, "ss_524a39da392ee83dde091033562bc719d46b5838.1920x1080.jpg"),
      steam(2358720, "ss_968bbc9caceb7d798bd0c393e1e9b4c44ed6d835.1920x1080.jpg"),
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64 bits",
        processor: "Intel Core i5-8400 / AMD Ryzen 5 1600",
        ram: gb(16),
        gpu: "GTX 1060 6 GB / RX 580 8 GB",
        disk_space: gb(130),
      },
      recommended: {
        os: "Windows 10 64 bits",
        processor: "Intel Core i7-9700 / AMD Ryzen 5 5500",
        ram: gb(16),
        gpu: "RTX 2060 / RX 5700 XT",
        disk_space: gb(130),
      },
    },
    keyPrefix: "WUKNG",
    variants: [
      { platform: "Steam", price: "229.00", discountPercent: 13, releaseDate: "2024-08-20", keys: 5 },
    ],
  },
  {
    slug: "forza-horizon-5",
    title: "Forza Horizon 5",
    category: Category.GAME,
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    coverPath: steam(1551360, "capsule_616x353.jpg"),
    trailerYoutubeId: "Rv7xLt5yNsM",
    description:
      "Dirija em um mundo aberto vivo e em constante mudança, inspirado nas paisagens do México.\n\nParticipe de corridas, expedições e eventos sazonais ao volante de centenas de carros, sozinho ou com amigos, e construa o seu próprio Horizon Festival.",
    genres: ["Corrida"],
    gallery: [
      steam(1551360, "ss_cf56e25a0290556ba83229eb0ab370d10be0407c.1920x1080.jpg"),
      steam(1551360, "ss_00f0090174380eeaf8753bd3d1028b6772c3aebf.1920x1080.jpg"),
      steam(1551360, "ss_b65236b365315ebb6da6114ce42cd74b59cab3c8.1920x1080.jpg"),
      steam(1551360, "ss_0a13a7ccd38e7c3e6a5f1720050732833b53b6a8.1920x1080.jpg"),
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64 bits",
        processor: "Intel Core i5-4460 / AMD Ryzen 3 1200",
        ram: gb(8),
        gpu: "GTX 970 / RX 470",
        disk_space: gb(110),
      },
      recommended: {
        os: "Windows 10 64 bits",
        processor: "Intel Core i5-8400 / AMD Ryzen 5 1500X",
        ram: gb(16),
        gpu: "GTX 1070 / RX 590",
        disk_space: gb(110),
      },
    },
    keyPrefix: "FH5XX",
    variants: [
      { platform: "Steam", price: "249.00", discountPercent: 50, releaseDate: "2021-11-09", keys: 5 },
    ],
  },
];

const COUPONS = [
  {
    code: "KEY10",
    discountType: "PERCENTAGE" as const,
    discountValue: "10",
    minOrderAmount: null,
  },
  {
    code: "BEMVINDO20",
    discountType: "FIXED_AMOUNT" as const,
    discountValue: "20",
    minOrderAmount: "100",
  },
];

const TICKET_CATEGORIES = [
  "Problema com chave digital",
  "Dúvida sobre pagamento",
  "Solicitação de reembolso",
  "Outro assunto",
];

async function createAdmin() {
  const adminEmail = process.env["ADMIN_EMAIL"]?.trim().toLowerCase();
  const adminPassword = (process.env["ADMIN_PASSWORD"]);

  if (!adminEmail || !adminPassword) {
    console.warn("ADMIN_EMAIL ou ADMIN_PASSWORD no .env estão vazios");
    return;
  }
  await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: {
        firstName: "Admin",
        lastName: "Teste",
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        role: "ADMIN",
      },
  });
}

async function main() {

  await createAdmin()

  for (const name of GENRES) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }

  const platforms = new Map<PlatformName, { id: string; keySuffix: string }>();
  for (const { name, hasSystemRequirements, keySuffix } of PLATFORMS) {
    const platform = await prisma.platform.upsert({
      where: { name },
      update: { hasSystemRequirements },
      create: { name, hasSystemRequirements },
    });
    platforms.set(name, { id: platform.id, keySuffix });
  }

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const existingPromo = await prisma.promotion.findFirst({
    where: { name: "Ofertas da Semana" },
  });
  const promotion = existingPromo
    ? await prisma.promotion.update({
        where: { id: existingPromo.id },
        data: { startsAt: now, endsAt: in30Days, isActive: true },
      })
    : await prisma.promotion.create({
        data: {
          name: "Ofertas da Semana",
          description: "Promoções de desenvolvimento",
          startsAt: now,
          endsAt: in30Days,
        },
      });

  /** Ids já gravados, para ligar DLCs e edições ao jogo base. */
  const productIds = new Map<string, string>();

  for (const { genres, gallery, variants, keyPrefix, baseSlug, systemRequirements, ...fields } of PRODUCTS) {
    const baseProductId = baseSlug ? productIds.get(baseSlug) : undefined;
    if (baseSlug && !baseProductId) {
      throw new Error(`Produto base "${baseSlug}" precisa vir antes de "${fields.slug}" no seed`);
    }

    const galleryItems = gallery.map((path, position) => ({ path, position }));
    const data = {
      ...fields,
      baseProductId: baseProductId ?? null,
      systemRequirements: systemRequirements ?? Prisma.DbNull,
    };

    // Rodar o seed de novo sincroniza o produto com os dados acima.
    const product = await prisma.product.upsert({
      where: { slug: fields.slug },
      update: {
        ...data,
        genres: { set: genres.map((name) => ({ name })) },
        gallery: { deleteMany: {}, create: galleryItems },
      },
      create: {
        ...data,
        genres: { connect: genres.map((name) => ({ name })) },
        gallery: { create: galleryItems },
      },
    });
    productIds.set(product.slug, product.id);

    for (const { platform: platformName, price, discountPercent, keys, ...variantFields } of variants) {
      const platform = platforms.get(platformName);
      if (!platform) throw new Error(`Plataforma "${platformName}" não cadastrada no seed`);

      const releaseDate = new Date(variantFields.releaseDate);
      const variant = await prisma.productVariant.upsert({
        where: {
          productId_platformId: { productId: product.id, platformId: platform.id },
        },
        update: { price, status: "PUBLISHED", releaseDate },
        create: {
          productId: product.id,
          platformId: platform.id,
          price,
          status: "PUBLISHED",
          releaseDate,
        },
      });

      for (let i = 1; i <= keys; i++) {
        const keyCode = `${keyPrefix}-${String(i).padStart(5, "0")}-${platform.keySuffix}`;
        await prisma.key.upsert({
          where: { keyCode },
          update: {},
          create: { variantId: variant.id, keyCode },
        });
      }

      const promotionVariant = { promotionId: promotion.id, variantId: variant.id };
      if (discountPercent === null) {
        await prisma.promotionProduct.deleteMany({ where: promotionVariant });
      } else {
        await prisma.promotionProduct.upsert({
          where: { promotionId_variantId: promotionVariant },
          update: { discountPercent },
          create: { ...promotionVariant, discountPercent },
        });
      }
    }
  }

  for (const coupon of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  for (const name of TICKET_CATEGORIES) {
    await prisma.ticketCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const [products, variants, keys, coupons, ticketCategories] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.key.count(),
    prisma.coupon.count(),
    prisma.ticketCategory.count(),
  ]);
  console.log({ products, variants, keys, coupons, ticketCategories });
}
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());