import Link from "next/link";
import { KeyRound } from "lucide-react";
import styles from "./Logo.module.css";

// Usado na Header e no topo do sidebar mobile. No mobile o sidebar cobre a Header e o logo dele
// fica exatamente no lugar do dela, por isso os dois precisam ser o mesmo componente.
export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className={styles.logo} aria-label="Keystation" onClick={onClick}>
      <KeyRound className={styles.icon} />
      <span className={styles.text}>Keystation</span>
    </Link>
  )
}
