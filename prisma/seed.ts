import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const GENRES = ["Ação", "RPG", "Mundo Aberto", "Soulslike", "Corrida", "Indie"];

type SeedGame = {
  slug: string;
  title: string;
  developer: string;
  publisher: string;
  releaseDate: string;
  coverPath: string;
  description: string;
  genres: string[];
  price: string;
  discountPercent: number | null;
  keyPrefix: string;
  systemRequirements?: Prisma.InputJsonObject;
};

const GAMES: SeedGame[] = [
  {
    slug: "cyberpunk-2077-ultimate-edition",
    title: "Cyberpunk 2077: Ultimate Edition",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: "2020-12-10",
    coverPath:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop",
    description:
      "Mergulhe em Night City, uma megalópole obcecada por poder, glamour e modificações corporais. Jogue como V, um mercenário fora da lei atrás de um implante único que carrega a chave para a imortalidade.",
    genres: ["Ação", "RPG", "Mundo Aberto"],
    price: "199.99",
    discountPercent: 50,
    keyPrefix: "CP77X",
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Core i7-6700 or Ryzen 5 1600",
        memory: "12 GB RAM",
        graphics: "GeForce GTX 1060 6GB or Radeon RX 580",
        storage: "70 GB SSD",
      },
    },
  },
  {
    slug: "elden-ring-shadow-of-the-erdtree",
    title: "Elden Ring: Shadow of the Erdtree",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    releaseDate: "2022-02-25",
    coverPath:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    description:
      "Um RPG de ação em mundo aberto, criado pela FromSoftware, com exploração livre e combates desafiadores.",
    genres: ["Ação", "RPG", "Soulslike", "Mundo Aberto"],
    price: "229.90",
    discountPercent: 22,
    keyPrefix: "ELDRN",
  },
  {
    slug: "gta-6-pre-order",
    title: "Grand Theft Auto VI (Pre-Order)",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    releaseDate: "2026-11-19",
    coverPath:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    description:
      "Pré-venda de um jogo de ação em mundo aberto. Dados fictícios, usados apenas para desenvolvimento.",
    genres: ["Ação", "Mundo Aberto"],
    price: "299.99",
    discountPercent: null,
    keyPrefix: "GTA6X",
  },
  {
    slug: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    releaseDate: "2023-08-03",
    coverPath:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    description:
      "Um RPG por turnos baseado em Dungeons & Dragons, com escolhas que mudam a história.",
    genres: ["RPG"],
    price: "199.99",
    discountPercent: 25,
    keyPrefix: "BG3XX",
  },
  {
    slug: "black-myth-wukong",
    title: "Black Myth: Wukong",
    developer: "Game Science",
    publisher: "Game Science",
    releaseDate: "2024-08-20",
    coverPath:
      "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    description:
      "Um jogo de ação inspirado na lenda chinesa da Jornada ao Oeste.",
    genres: ["Ação"],
    price: "229.00",
    discountPercent: 13,
    keyPrefix: "WUKNG",
  },
  {
    slug: "forza-horizon-5",
    title: "Forza Horizon 5",
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    releaseDate: "2021-11-09",
    coverPath:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
    description:
      "Um jogo de corrida em mundo aberto, com centenas de carros e corridas pelo México.",
    genres: ["Corrida", "Mundo Aberto"],
    price: "249.00",
    discountPercent: 50,
    keyPrefix: "FH5XX",
  },
];

const KEYS_PER_VARIANT = 5;

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

async function main() {
  for (const name of GENRES) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }

  const steam = await prisma.platform.upsert({
    where: { name: "Steam" },
    update: {},
    create: { name: "Steam" },
  });

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

  for (const game of GAMES) {
    const product = await prisma.product.upsert({
      where: { slug: game.slug },
      update: {},
      create: {
        category: "GAME",
        title: game.title,
        slug: game.slug,
        description: game.description,
        developer: game.developer,
        publisher: game.publisher,
        coverPath: game.coverPath,
        systemRequirements: game.systemRequirements,
        genres: { connect: game.genres.map((name) => ({ name })) },
      },
    });

    const releaseDate = new Date(game.releaseDate);
    const variant = await prisma.productVariant.upsert({
      where: {
        productId_platformId: { productId: product.id, platformId: steam.id },
      },
      update: { price: game.price, status: "PUBLISHED", releaseDate },
      create: {
        productId: product.id,
        platformId: steam.id,
        price: game.price,
        status: "PUBLISHED",
        releaseDate,
      },
    });

    for (let i = 1; i <= KEYS_PER_VARIANT; i++) {
      const keyCode = `${game.keyPrefix}-${String(i).padStart(5, "0")}-DEVKS`;
      await prisma.key.upsert({
        where: { keyCode },
        update: {},
        create: { variantId: variant.id, keyCode },
      });
    }

    if (game.discountPercent !== null) {
      await prisma.promotionProduct.upsert({
        where: {
          promotionId_variantId: {
            promotionId: promotion.id,
            variantId: variant.id,
          },
        },
        update: { discountPercent: game.discountPercent },
        create: {
          promotionId: promotion.id,
          variantId: variant.id,
          discountPercent: game.discountPercent,
        },
      });
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