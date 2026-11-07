/** Dados de exemplo enquanto o catálogo não vem do banco (Prisma). */

export interface Game {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  promotionalPrice: number | null;
  developer: string;
  categoryName: string;
}

export interface GameRequirements {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

/** Dados da página do jogo: tudo do card (`Game`, incluindo a mesma capa) mais o que só o detalhe usa. */
export interface GameDetail extends Game {
  description: string;
  publisher: string;
  releaseDate: string;
  platform: string;
  requirements: GameRequirements;
}

export const GAMES: Game[] = [
  {
    id: "1",
    title: "Cyberpunk 2077: Ultimate Edition",
    slug: "cyberpunk-2077-ultimate-edition",
    coverImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop",
    price: 199.99,
    promotionalPrice: 99.99,
    developer: "CD Projekt Red",
    categoryName: "RPG de Ação",
  },
  {
    id: "2",
    title: "Elden Ring: Shadow of the Erdtree",
    slug: "elden-ring-shadow-of-the-erdtree",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    price: 229.90,
    promotionalPrice: 179.90,
    developer: "FromSoftware",
    categoryName: "Soulslike",
  },
  {
    id: "3",
    title: "Grand Theft Auto VI (Pre-Order)",
    slug: "gta-6-pre-order",
    coverImage: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=800&auto=format&fit=crop",
    price: 299.99,
    promotionalPrice: null,
    developer: "Rockstar Games",
    categoryName: "Mundo Aberto",
  },
  {
    id: "4",
    title: "Baldur's Gate 3",
    slug: "baldurs-gate-3",
    coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    price: 199.99,
    promotionalPrice: 149.99,
    developer: "Larian Studios",
    categoryName: "RPG",
  },
  {
    id: "5",
    title: "Black Myth: Wukong",
    slug: "black-myth-wukong",
    coverImage: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop",
    price: 229.00,
    promotionalPrice: 199.00,
    developer: "Game Science",
    categoryName: "Ação",
  },
  {
    id: "6",
    title: "Forza Horizon 5",
    slug: "forza-horizon-5",
    coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
    price: 249.00,
    promotionalPrice: 124.50,
    developer: "Playground Games",
    categoryName: "Corrida",
  },
];

/** Destaques da home: os 4 primeiros do catálogo. */
export const FEATURED_GAMES: Game[] = GAMES.slice(0, 4);

type GameExtras = Omit<GameDetail, keyof Game>;

/**
 * Informações extras de cada jogo, por id (a rota ainda é /products/[id]).
 * Requisitos e datas são aproximados: servem só para a interface enquanto não há banco.
 */
const GAME_EXTRAS: Record<string, GameExtras> = {
  "1": {
    description: "Mergulhe em Night City, uma megalópole obcecada por poder, glamour e modificações corporais. Jogue como V, um mercenário fora da lei atrás de um implante único que carrega a chave para a imortalidade. Personalize seu cyberware, conjunto de habilidades e estilo de jogo enquanto explora uma vasta cidade onde suas escolhas moldam a história e o mundo ao seu redor.",
    publisher: "CD Projekt",
    releaseDate: "10 de Dezembro de 2020",
    platform: "Steam (PC)",
    requirements: {
      os: "Windows 10 64-bit",
      processor: "Core i7-6700 or Ryzen 5 1600",
      memory: "12 GB RAM",
      graphics: "GeForce GTX 1060 6GB or Radeon RX 580",
      storage: "70 GB SSD",
    },
  },
  "2": {
    description: "Parta para as Terras das Sombras, um reino escondido além da névoa, e enfrente chefes colossais na maior expansão de Elden Ring. Explore áreas interconectadas cheias de segredos, novas armas, magias e armaduras, e descubra o destino de Miquella em um desafio feito para jogadores experientes.",
    publisher: "Bandai Namco Entertainment",
    releaseDate: "21 de Junho de 2024",
    platform: "Steam (PC)",
    requirements: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i5-8400 or AMD Ryzen 3 3300X",
      memory: "12 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 3GB or AMD Radeon RX 580 4GB",
      storage: "60 GB SSD",
    },
  },
  "3": {
    description: "Retorne a Vice City e arredores no próximo capítulo da série Grand Theft Auto. Crimes, reviravoltas e um mundo aberto em escala inédita aguardam em uma história de ambição e traição. A chave desta pré-venda será liberada no cofre assim que o jogo for lançado.",
    publisher: "Rockstar Games",
    releaseDate: "Em breve (pré-venda)",
    platform: "Steam (PC)",
    requirements: {
      os: "A divulgar",
      processor: "A divulgar",
      memory: "A divulgar",
      graphics: "A divulgar",
      storage: "A divulgar",
    },
  },
  "4": {
    description: "Reúna seu grupo e retorne aos Reinos Esquecidos em uma história de companheirismo e traição, sacrifício e sobrevivência, e a sedução do poder absoluto. Baseado nas regras de Dungeons & Dragons, cada escolha, diálogo e rolagem de dado muda o rumo da aventura, sozinho ou em cooperativo.",
    publisher: "Larian Studios",
    releaseDate: "3 de Agosto de 2023",
    platform: "Steam (PC)",
    requirements: {
      os: "Windows 10 64-bit",
      processor: "Intel i5-4690 or AMD FX 4350",
      memory: "8 GB RAM",
      graphics: "NVIDIA GTX 970 or AMD Radeon RX 480 (4GB+ VRAM)",
      storage: "150 GB SSD",
    },
  },
  "5": {
    description: "Inspirado no clássico chinês Jornada ao Oeste, este RPG de ação acompanha o Destinado em uma jornada repleta de mitos, criaturas lendárias e chefes memoráveis. Combate rápido, transformações e magias criam um desafio visualmente impressionante.",
    publisher: "Game Science",
    releaseDate: "20 de Agosto de 2024",
    platform: "Steam (PC)",
    requirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-8400 or AMD Ryzen 5 1600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB",
      storage: "130 GB SSD",
    },
  },
  "6": {
    description: "Dirija em um mundo aberto vivo e em constante mudança, inspirado nas paisagens do México. Participe de corridas, expedições e eventos sazonais ao volante de centenas de carros, sozinho ou com amigos, e construa o seu próprio Horizon Festival.",
    publisher: "Xbox Game Studios",
    releaseDate: "9 de Novembro de 2021",
    platform: "Steam (PC)",
    requirements: {
      os: "Windows 10 version 15063.0 or higher",
      processor: "Intel Core i5-4460 or AMD Ryzen 3 1200",
      memory: "8 GB RAM",
      graphics: "NVIDIA GTX 970 or AMD Radeon RX 470",
      storage: "110 GB SSD",
    },
  },
};

/** Detalhe de um jogo pelo id, ou `undefined` se não existir. A capa é a mesma do card. */
export function getGameDetail(id: string): GameDetail | undefined {
  const game = GAMES.find((item) => item.id === id);
  const extras = GAME_EXTRAS[id];
  if (!game || !extras) return undefined;
  return { ...game, ...extras };
}
