export const MOCK_ORDER_NUMBER = "#12345";

export interface OrderGameItem {
  id: string;
  title: string;
  price: number;
  platform: string;
  keyCount: number;
  coverImage: string;
}

export type OrderStatus = "Aprovado" | "Pendente" | "Cancelado";

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  itemSummary: string;
  itemCountLabel: string;
  items: OrderGameItem[];
}

export const MOCK_ORDERS: OrderHistoryItem[] = [
  {
    id: "ord-1",
    orderNumber: "#12345",
    date: "05/10/2026",
    total: 140.0,
    status: "Aprovado",
    paymentMethod: "Cartão final 4242",
    itemSummary: "Cyberpunk 2077 + Hades",
    itemCountLabel: "2 jogos",
    items: [
      {
        id: "g1",
        title: "Cyberpunk 2077",
        price: 100.0,
        platform: "Steam",
        keyCount: 1,
        coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "g2",
        title: "Hades",
        price: 40.0,
        platform: "Steam",
        keyCount: 1,
        coverImage: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "#12344",
    date: "04/10/2026",
    total: 60.0,
    status: "Pendente",
    paymentMethod: "Pix",
    itemSummary: "Hollow Knight + Stardew Valley",
    itemCountLabel: "2 jogos",
    items: [
      {
        id: "g3",
        title: "Hollow Knight",
        price: 30.0,
        platform: "Steam",
        keyCount: 1,
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "g4",
        title: "Stardew Valley",
        price: 30.0,
        platform: "Steam",
        keyCount: 1,
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "#12343",
    date: "03/10/2026",
    total: 120.0,
    status: "Cancelado",
    paymentMethod: "Boleto",
    itemSummary: "Hollow Knight: Silksong",
    itemCountLabel: "1 jogo",
    items: [
      {
        id: "g5",
        title: "Hollow Knight: Silksong",
        price: 120.0,
        platform: "Steam",
        keyCount: 1,
        coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
];
