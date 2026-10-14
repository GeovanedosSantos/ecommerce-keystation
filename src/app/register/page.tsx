import Link from "next/link";
import { KeyRound, UserPlus } from "lucide-react";
import styles from "../login/auth.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoHeader}>
          <KeyRound size={32} className={styles.logoIcon} />
          <h1>Keystation</h1>
        </div>
        <p className={styles.subtitle}>Crie sua conta e ganhe acesso instantâneo ao cofre de chaves.</p>

        <form className={styles.form}>
          <div className={styles.field}>
            <label>Nome Completo</label>
            <input type="text" placeholder="Seu nome" />
          </div>

          <div className={styles.field}>
            <label>E-mail</label>
            <input type="email" placeholder="seu.email@exemplo.com" />
          </div>

          <div className={styles.field}>
            <label>Senha</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div className={styles.field}>
            <label>Confirmar Senha</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div className={styles.checkboxField}>
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">Li e concordo com os <Link href="/help/terms">Termos de Serviço</Link></label>
          </div>

          <button type="submit" className={styles.submitBtn}>
            <UserPlus size={18} /> Criar Conta
          </button>
        </form>

        <div className={styles.footerLink}>
          <span>Já tem uma conta?</span>
          <Link href="/login">Faça login</Link>
        </div>
      </div>
    </div>
  );
}
