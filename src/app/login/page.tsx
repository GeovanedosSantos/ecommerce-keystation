import Link from "next/link";
import { KeyRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import styles from "./auth.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logoHeader}>
          <KeyRound size={32} className={styles.logoIcon} />
          <h1>Keystation</h1>
        </div>
        <p className={styles.subtitle}>Entre na sua conta para acessar seu cofre e pedidos.</p>

        <form className={styles.form}>
          <FormField label="E-mail">
            <input type="email" placeholder="seu.email@exemplo.com" />
          </FormField>

          <FormField label="Senha">
            <input type="password" placeholder="••••••••" />
          </FormField>

          <Button type="submit" className={styles.submitBtn}>
            <LogIn size={18} /> Entrar na Conta
          </Button>
        </form>

        <div className={styles.footerLink}>
          <span>Não tem uma conta?</span>
          <Link href="/register">Cadastre-se grátis</Link>
        </div>
      </div>
    </div>
  );
}
