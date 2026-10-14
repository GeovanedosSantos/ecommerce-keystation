import Link from "next/link";
import Image from "next/image";
import { GameCard } from "@/components/GameCard";
import { Sparkles, TrendingUp, ShieldCheck, Zap, ArrowRight, Trophy, Swords, Compass, Gamepad2, Flame } from "lucide-react";
import styles from "./page.module.css";

const CATEGORIES = [
  { name: "RPG", count: "jogos", icon: Swords, href: "/catalog?category=rpg" },
  { name: "Ação", count: "jogos", icon: Flame, href: "/catalog?category=action" },
  { name: "Mundo Aberto", count: "jogos", icon: Compass, href: "/catalog?category=open-world" },
  { name: "Indie", count: "jogos", icon: Gamepad2, href: "/catalog?category=indie" },
];

const FEATURED_GAMES = [
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
];

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <Sparkles size={16} /> Chaves Digitais Instantâneas
          </span>
          <h1 className={styles.heroTitle}>
            Sua próxima aventura épica começa <span>aqui</span>.
          </h1>
          <p className={styles.heroSubtitle}>
            Adquira chaves originais para Steam, Epic Games e Ubisoft com entrega imediata, os melhores preços do mercado e garantia total.
          </p>
          <div className={styles.heroActions}>
            <Link href="/catalog" className={styles.primaryBtn}>
              Explorar Catálogo
            </Link>
            <Link href="/account/vault" className={styles.secondaryBtn}>
              Acessar Cofre
            </Link>
          </div>
        </div>
        <div className={styles.heroImageWrapper}>
          <div className={styles.heroOverlay} />
          <Image
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop"
            alt="Keystation Gaming"
            fill
            priority
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* Features / Benefits */}
      <section className={styles.features}>
        <div className={styles.featureItem}>
          <Zap className={styles.featureIcon} />
          <div>
            <h3>Entrega Instantânea</h3>
            <p>Receba sua chave direto no cofre em segundos após a confirmação.</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <ShieldCheck className={styles.featureIcon} />
          <div>
            <h3>100% Garantido</h3>
            <p>Chaves oficiais obtidas diretamente de distribuidores autorizados.</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <Trophy className={styles.featureIcon} />
          <div>
            <h3>Melhores Preços</h3>
            <p>Descontos imperdíveis e cashback em todas as suas compras.</p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <Compass className={styles.titleIcon} /> Navegue por Categorias
          </h2>
          <Link href="/catalog" className={styles.seeAll}>
            Ver todas
          </Link>
        </div>
        <div className={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link key={cat.name} href={cat.href} className={styles.categoryCard}>
                <IconComponent className={styles.categoryIcon} size={28} />
                <span>{cat.name}</span>
                <span className={styles.categoryCount}>{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Games Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            <TrendingUp className={styles.titleIcon} /> Destaques & Promoções
          </h2>
          <Link href="/catalog" className={styles.seeAll}>
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.gamesGrid}>
          {FEATURED_GAMES.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </section>
    </div>
  );
}
