import { Suspense } from "react";
import Link from "next/link";
import { LogOut, ShoppingCart, User } from "lucide-react";
import styles from "./Header.module.css";
import { HeaderContent } from "./HeaderContent";
import { getSession } from "@/infra/session-cookie";
import { logoutAction } from "@/app/logout/actions";

async function UserButtons() {
  const session = await getSession();
  // TODO (Feature 4): trocar pelo total real de itens do carrinho.
  const cartCount: number = 0;
  if (session) {
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
        <form action={logoutAction} style={{ display: "contents" }}>
          <button type="submit" className={styles.userBtn} aria-label="Sair">
            <LogOut size={20} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.nav}>
      <Link href="/login" className={styles.loginButton}>
        Entrar
      </Link>
    </div>
  );
}

export function Header() {
  return (
    <header className={styles.header}>
      <HeaderContent
        userButtons={
          <Suspense fallback={<div className={styles.nav} />}>
            <UserButtons />
          </Suspense>
        }
      />
    </header>
  );
}