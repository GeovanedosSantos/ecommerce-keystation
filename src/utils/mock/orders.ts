export const MOCK_ORDER_NUMBER = "KS-849204";

export interface OrderGameItem {
  id: string;
  title: string;
  price: number;
  platform: string;
  coverImage: string;
}

export type OrderStatus = "Aprovado" | "Pendente" | "Cancelado";

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: "Cartão de Crédito" | "Pix" | "Boleto";
  items: OrderGameItem[];
}

export const MOCK_ORDERS: OrderHistoryItem[] = [
  {
    id: "ord-1",
    orderNumber: "KS-849204",
    date: "12/10/2026",
    total: 399.8,
    status: "Aprovado",
    paymentMethod: "Pix",
    items: [
      {
        id: "g1",
        title: "Cyberpunk 2077: Ultimate Edition",
        price: 199.9,
        platform: "Steam (PC)",
        coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
      },
      {
        id: "g2",
        title: "Elden Ring: Shadow of the Erdtree",
        price: 199.9,
        platform: "Steam (PC)",
        coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "KS-718293",
    date: "05/09/2026",
    total: 249.9,
    status: "Aprovado",
    paymentMethod: "Cartão de Crédito",
    items: [
      {
        id: "g3",
        title: "Baldur's Gate 3",
        price: 249.9,
        platform: "Steam (PC)",
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "KS-605912",
    date: "28/08/2026",
    total: 129.9,
    status: "Cancelado",
    paymentMethod: "Boleto",
    items: [
      {
        id: "g4",
        title: "Hollow Knight: Silksong",
        price: 129.9,
        platform: "Steam (PC)",
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      },
    ],
  },
];
