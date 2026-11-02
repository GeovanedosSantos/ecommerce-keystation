import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import styles from "./Header.module.css";
import { HeaderContent } from "./HeaderContent";

function UserButtons({isLogged, cartCount}: { isLogged: boolean, cartCount: number }) {
  if (isLogged) {
    return (
        <div className={styles.nav}>
          <Link
            href="/cart"
            className={styles.cartBtn}
            aria-label={cartCount > 0 ? `Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "Carrinho"}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className={styles.cartBadge} aria-hidden="true">{cartCount}</span>}
          </Link>
          <Link href="/account/vault" className={styles.userBtn} aria-label="Conta">
            <User size={20} />
          </Link>
        </div>
    )
  }

  return (
    <div className={styles.nav}>
      <Link href="/login" className={styles.loginButton}>
        Entrar
      </Link>
    </div>
  )
}

export function Header() {
  const isLogged = true
  const cartCount = 2

  return (
    <header className={styles.header}>
      <HeaderContent userButtons={<UserButtons isLogged={isLogged} cartCount={cartCount} />} />
    </header>
  );
}
