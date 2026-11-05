import Link from "next/link";
import { KeyRound, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
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
          <FormField label="Nome Completo">
            <input type="text" placeholder="Seu nome" />
          </FormField>

          <FormField label="E-mail">
            <input type="email" placeholder="seu.email@exemplo.com" />
          </FormField>

          <FormField label="Senha">
            <input type="password" placeholder="••••••••" />
          </FormField>

          <FormField label="Confirmar Senha">
            <input type="password" placeholder="••••••••" />
          </FormField>

          <div className={styles.checkboxField}>
            <input type="checkbox" id="terms" />
            <label htmlFor="terms">Li e concordo com os <Link href="/help/terms">Termos de Serviço</Link></label>
          </div>

          <Button type="submit" className={styles.submitBtn}>
            <UserPlus size={18} /> Criar Conta
          </Button>
        </form>

        <div className={styles.footerLink}>
          <span>Já tem uma conta?</span>
          <Link href="/login">Faça login</Link>
        </div>
      </div>
    </div>
  );
}
