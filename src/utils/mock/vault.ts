export interface VaultKey {
  id: string;
  gameTitle: string;
  coverImage: string;
  platform: string;
  key: string;
  purchaseDate: string;
}

export const VAULT_KEYS: VaultKey[] = [
  {
    id: "v1",
    gameTitle: "Cyberpunk 2077: Ultimate Edition",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    platform: "Steam (PC)",
    key: "X9K2P-M8N3Q-W4R7T",
    purchaseDate: "12/10/2026",
  },
  {
    id: "v2",
    gameTitle: "Elden Ring: Shadow of the Erdtree",
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    platform: "Steam (PC)",
    key: "ELND-77891-BGT42",
    purchaseDate: "12/10/2026",
  },
];
