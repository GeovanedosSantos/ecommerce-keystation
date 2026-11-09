import Link from "next/link";
import { LogIn } from "lucide-react";
import { AuthCard, AuthForm } from "@/components/ui/AuthCard/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <AuthCard
      subtitle="Entre na sua conta para acessar seu cofre e pedidos."
      footerText="Não tem uma conta?"
      footerLinkLabel="Cadastre-se grátis"
      footerHref="/register"
    >
      <AuthForm>
        <FormField label="E-mail">
          <input type="email" placeholder="seu.email@exemplo.com" />
        </FormField>

        <FormField label="Senha">
          <input type="password" placeholder="••••••••" />
        </FormField>

        <div className={styles.forgotPasswordRow}>
          <Link href="/forgot-password" className={styles.forgotPasswordLink}>
            Esqueceu sua senha?
          </Link>
        </div>

        <Button type="submit">
          <LogIn size={18} /> Entrar na Conta
        </Button>
      </AuthForm>
    </AuthCard>
  );
}
