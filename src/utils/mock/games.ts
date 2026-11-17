/**
 * Cards da home e do catálogo enquanto a vitrine não vem do banco.
 * A página de produto já lê do banco: os dados completos de cada jogo ficam em prisma/seed.ts,
 * e os slugs, preços e capas daqui precisam continuar iguais aos de lá.
 */

/** Capsules (616x353) da loja Steam usadas nos cards. */
const steamAsset = (appId: number, file: string) =>
  `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${file}`;

export interface Game {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  promotionalPrice: number | null;
  developer: string;
  /** Plataforma deste card: cada card representa uma variant (o mesmo jogo pode ter um card por plataforma). */
  platform: string;
}

export const GAMES: Game[] = [
  {
    id: "1",
    title: "Cyberpunk 2077: Ultimate Edition",
    slug: "cyberpunk-2077-ultimate-edition",
    // A Ultimate Edition é um pacote na Steam e não tem capsule: capa recortada em 616:353, servida de public/.
    coverImage: "/covers/cyberpunk-2077-ultimate-edition.jpg",
    price: 199.99,
    promotionalPrice: 100.0,
    developer: "CD Projekt Red",
    platform: "Steam",
  },
  {
    id: "2",
    title: "Elden Ring",
    slug: "elden-ring",
    coverImage: steamAsset(1245620, "capsule_616x353.jpg"),
    price: 229.90,
    promotionalPrice: 179.32,
    developer: "FromSoftware",
    platform: "Steam",
  },
  {
    id: "3",
    title: "Grand Theft Auto VI",
    slug: "grand-theft-auto-vi",
    // Fora da Steam: capa gerada na proporção da capsule (616:353), em 2x, servida de public/.
    coverImage: "/covers/grand-theft-auto-vi.jpg",
    price: 299.99,
    promotionalPrice: null,
    developer: "Rockstar Games",
    platform: "PlayStation",
  },
  {
    id: "4",
    title: "Baldur's Gate 3",
    slug: "baldurs-gate-3",
    coverImage: steamAsset(1086940, "capsule_616x353.jpg"),
    price: 199.99,
    promotionalPrice: 149.99,
    developer: "Larian Studios",
    platform: "Steam",
  },
  {
    id: "5",
    title: "Black Myth: Wukong",
    slug: "black-myth-wukong",
    coverImage: steamAsset(2358720, "capsule_616x353.jpg"),
    price: 229.00,
    promotionalPrice: 199.23,
    developer: "Game Science",
    platform: "Steam",
  },
  {
    id: "6",
    title: "Forza Horizon 5",
    slug: "forza-horizon-5",
    coverImage: steamAsset(1551360, "capsule_616x353.jpg"),
    price: 249.00,
    promotionalPrice: 124.50,
    developer: "Playground Games",
    platform: "Steam",
  },
  {
    id: "7",
    title: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    coverImage: steamAsset(1091500, "capsule_616x353.jpg"),
    price: 129.90,
    promotionalPrice: null,
    developer: "CD Projekt Red",
    platform: "Steam",
  },
];

/** Destaques da home: os 4 primeiros do catálogo. */
export const FEATURED_GAMES: Game[] = GAMES.slice(0, 4);
