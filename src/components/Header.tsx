import Link from "next/link";
import { ShoppingCart, User, Search, KeyRound, ShieldCheck } from "lucide-react";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <KeyRound className={styles.logoIcon} />
          <span>Keystation</span>
        </Link>

        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar jogos, desenvolvedoras..."
            className={styles.searchInput}
          />
        </div>

        <nav className={styles.nav}>
          <Link href="/catalog" className={styles.navLink}>
            Catálogo
          </Link>
          <Link href="/support" className={styles.navLink}>
            Suporte
          </Link>
          <Link href="/account/vault" className={styles.navLink}>
            <KeyRound size={18} />
            <span>Cofre</span>
          </Link>
          <Link href="/cart" className={styles.cartBtn} aria-label="Carrinho">
            <ShoppingCart size={20} />
            <span className={styles.cartBadge}>2</span>
          </Link>
          <Link href="/login" className={styles.userBtn} aria-label="Conta">
            <User size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
