import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ShieldCheck, Zap, Cpu, HardDrive, Monitor, CheckCircle2 } from "lucide-react";
import styles from "./product.module.css";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Mock game data corresponding to the requested id
  const game = {
    id,
    title: id === "1" ? "Cyberpunk 2077: Ultimate Edition" : "Elden Ring: Shadow of the Erdtree",
    description: "Mergulhe em Night City, uma megalópole obcecada por poder, glamour e modificações corporales. Jogue como V, um mercenário fora da lei atrás de um implante único que carrega a chave para a imortalidade. Personalize seu cyberware, conjunto de habilidades e estilo de jogo enquanto explora uma vasta cidade onde suas escolhas moldam a história e o mundo ao seu redor.",
    price: 199.99,
    promotionalPrice: 99.99,
    coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseDate: "10 de Dezembro de 2020",
    categoryName: "RPG de Ação",
    platform: "Steam (PC)",
    requirements: {
      os: "Windows 10 64-bit",
      processor: "Core i7-6700 or Ryzen 5 1600",
      memory: "12 GB RAM",
      graphics: "GeForce GTX 1060 6GB or Radeon RX 580",
      storage: "70 GB SSD",
    },
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainGrid}>
        {/* Left: Gallery & Info */}
        <div className={styles.leftCol}>
          <div className={styles.bannerWrapper}>
            <Image
              src={game.coverImage}
              alt={game.title}
              fill
              priority
              className={styles.bannerImage}
            />
            <span className={styles.categoryBadge}>{game.categoryName}</span>
          </div>

          <div className={styles.section}>
            <h2>Sobre o Jogo</h2>
            <p className={styles.description}>{game.description}</p>
          </div>

          <div className={styles.section}>
            <h2>Requisitos de Sistema (PC)</h2>
            <div className={styles.requirementsBox}>
              <div className={styles.reqItem}>
                <Monitor size={18} className={styles.reqIcon} />
                <div>
                  <strong>Sistema Operacional:</strong>
                  <span>{game.requirements.os}</span>
                </div>
              </div>
              <div className={styles.reqItem}>
                <Cpu size={18} className={styles.reqIcon} />
                <div>
                  <strong>Processador:</strong>
                  <span>{game.requirements.processor}</span>
                </div>
              </div>
              <div className={styles.reqItem}>
                <HardDrive size={18} className={styles.reqIcon} />
                <div>
                  <strong>Memória & Armazenamento:</strong>
                  <span>{game.requirements.memory} | {game.requirements.storage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className={styles.rightCol}>
          <div className={styles.buyBox}>
            <span className={styles.platform}>
              <CheckCircle2 size={16} className={styles.successIcon} /> Ativação Oficial via {game.platform}
            </span>
            <h1 className={styles.title}>{game.title}</h1>
            <div className={styles.devInfo}>
              <span>Desenvolvedora: <strong>{game.developer}</strong></span>
              <span>Distribuidora: <strong>{game.publisher}</strong></span>
            </div>

            <div className={styles.pricingSection}>
              <div className={styles.prices}>
                <span className={styles.oldPrice}>R$ {game.price.toFixed(2)}</span>
                <span className={styles.currentPrice}>R$ {game.promotionalPrice.toFixed(2)}</span>
              </div>
              <span className={styles.discountTag}>-50% OFF</span>
            </div>

            <div className={styles.featuresList}>
              <div className={styles.featureRow}>
                <Zap size={16} className={styles.featIcon} />
                <span>Entrega Instantânea no Cofre</span>
              </div>
              <div className={styles.featureRow}>
                <ShieldCheck size={16} className={styles.featIcon} />
                <span>Garantia de Funcionamento</span>
              </div>
            </div>

            <Link href="/cart" className={styles.buyBtn}>
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
