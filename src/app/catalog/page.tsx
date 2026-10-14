import { GameCard } from "@/components/GameCard";
import { Filter, SlidersHorizontal } from "lucide-react";
import styles from "./catalog.module.css";

const CATALOG_GAMES = [
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

export default function CatalogPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Catálogo de Jogos</h1>
        <div className={styles.sortWrapper}>
          <SlidersHorizontal size={18} />
          <select className={styles.sortSelect} defaultValue="relevance">
            <option value="relevance">Mais Relevantes</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="newest">Lançamentos</option>
          </select>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Filters Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.filterGroup}>
            <h3>
              <Filter size={16} /> Gênero
            </h3>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> Ação
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> RPG
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> Mundo Aberto
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> Soulslike
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" /> Corrida
            </label>
          </div>

          <div className={styles.filterGroup}>
            <h3>Faixa de Preço</h3>
            <div className={styles.priceInputs}>
              <input type="number" placeholder="Min" defaultValue={0} />
              <span>até</span>
              <input type="number" placeholder="Max" defaultValue={300} />
            </div>
          </div>
        </aside>

        {/* Game Grid */}
        <div className={styles.gridContainer}>
          <div className={styles.grid}>
            {CATALOG_GAMES.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
