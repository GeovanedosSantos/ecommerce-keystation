export interface CartItem {
  id: string;
  title: string;
  coverImage: string;
  /** Preço a pagar (já com promoção). */
  price: number;
}

export const CART_ITEMS: CartItem[] = [
  {
    id: "1",
    title: "Cyberpunk 2077: Ultimate Edition",
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    price: 99.99,
  },
  {
    id: "2",
    title: "Elden Ring: Shadow of the Erdtree",
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop",
    price: 179.90,
  },
];
