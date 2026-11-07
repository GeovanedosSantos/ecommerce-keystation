import { GameCard } from "@/components/GameCard";
import { Filter, SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { GAMES } from "@/utils/mock/games";
import styles from "./catalog.module.css";

export default function CatalogPage() {
  return (
    <PageContainer paddingY="md">
      <SectionHeader title="Catálogo de Jogos" level="page">
        <div className={styles.sortWrapper}>
          <SlidersHorizontal size={18} />
          <select className={styles.sortSelect} defaultValue="relevance">
            <option value="relevance">Mais Relevantes</option>
            <option value="price-asc">Menor Preço</option>
            <option value="price-desc">Maior Preço</option>
            <option value="newest">Lançamentos</option>
          </select>
        </div>
      </SectionHeader>

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
            {GAMES.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
