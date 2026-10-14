import Link from "next/link";
import { KeyRound, ShieldCheck, HelpCircle } from "lucide-react";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.col}>
          <div className={styles.logo}>
            <KeyRound className={styles.logoIcon} />
            <span>Keystation</span>
          </div>
          <p className={styles.description}>
            Sua plataforma confiável de chaves digitais para jogos de PC com entrega instantânea e segurança garantida.
          </p>
        </div>

        <div className={styles.col}>
          <h4 className={styles.title}>Links Rápidos</h4>
          <Link href="/catalog" className={styles.link}>Catálogo de Jogos</Link>
          <Link href="/support" className={styles.link}>Central de Suporte</Link>
          <Link href="/help/steam-guide" className={styles.link}>Como Resgatar na Steam</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.title}>Legal</h4>
          <Link href="/help/terms" className={styles.link}>Termos de Serviço</Link>
          <Link href="/help/refund" className={styles.link}>Política de Reembolso</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.title}>Segurança</h4>
          <div className={styles.securityBadge}>
            <ShieldCheck size={20} className={styles.successIcon} />
            <span>Chaves 100% Originais & Autorizadas</span>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>&copy; 2026 Ecommerce Keystation (Projeto A3). Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
