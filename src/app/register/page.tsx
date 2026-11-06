import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AuthCard, AuthForm } from "@/components/ui/AuthCard/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <AuthCard
      subtitle="Crie sua conta e ganhe acesso instantâneo ao cofre de chaves."
      footerText="Já tem uma conta?"
      footerLinkLabel="Faça login"
      footerHref="/login"
    >
      <AuthForm>
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

        <Button type="submit">
          <UserPlus size={18} /> Criar Conta
        </Button>
      </AuthForm>
    </AuthCard>
  );
}
