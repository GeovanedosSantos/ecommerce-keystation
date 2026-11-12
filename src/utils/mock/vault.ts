export interface VaultKey {
  id: string;
  gameTitle: string;
  coverImage: string;
  platform: string;
  region: string;
  orderNumber: string;
  purchaseDate: string;
  key: string;
  initialRevealed?: boolean;
}

export const VAULT_KEYS: VaultKey[] = [
  {
    id: "v1",
    gameTitle: "Cyberpunk 2077",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    platform: "Steam",
    region: "Brasil",
    orderNumber: "#12345",
    purchaseDate: "05/10/2026",
    key: "X9K2P-M8N3Q-W4R7T",
    initialRevealed: false,
  },
  {
    id: "v2",
    gameTitle: "Hades",
    coverImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop",
    platform: "Steam",
    region: "Brasil",
    orderNumber: "#12345",
    purchaseDate: "05/10/2026",
    key: "AAAAA-BBBBB-CCCCC",
    initialRevealed: true,
  },
];
