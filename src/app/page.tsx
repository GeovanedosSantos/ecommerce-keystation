import Link from "next/link";
import Image from "next/image";
import { GameCard } from "@/components/GameCard";
import { Sparkles, TrendingUp, ShieldCheck, Zap, ArrowRight, Trophy, Swords, Compass, Gamepad2, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { FEATURED_GAMES } from "@/utils/mock/games";
import styles from "./page.module.css";

const CATEGORIES = [
  { name: "RPG", count: "jogos", icon: Swords, href: "/catalog?category=rpg" },
  { name: "Ação", count: "jogos", icon: Flame, href: "/catalog?category=action" },
  { name: "Mundo Aberto", count: "jogos", icon: Compass, href: "/catalog?category=open-world" },
  { name: "Indie", count: "jogos", icon: Gamepad2, href: "/catalog?category=indie" },
];

export default function Home() {
  return (
    <PageContainer paddingY="md" gap="lg">
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
            <Button href="/catalog" size="md">
              Explorar Catálogo
            </Button>
            <Button href="/account/vault" variant="secondary" size="md">
              Acessar Cofre
            </Button>
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
        <SectionHeader
          title="Navegue por Categorias"
          icon={<Compass size={24} />}
          iconColor="primary"
          linkHref="/catalog"
          linkLabel="Ver todas"
        />
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
        <SectionHeader
          title="Destaques & Promoções"
          icon={<TrendingUp size={24} />}
          iconColor="primary"
          linkHref="/catalog"
          linkLabel="Ver todos"
          linkIcon={<ArrowRight size={16} />}
        />

        <div className={styles.gamesGrid}>
          {FEATURED_GAMES.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
