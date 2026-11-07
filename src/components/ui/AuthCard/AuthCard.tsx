import Link from "next/link";
import { KeyRound } from "lucide-react";
import type { FormHTMLAttributes, ReactNode } from "react";
import { PageContainer } from "../PageContainer/PageContainer";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  subtitle: string;
  /** Texto + link do rodapé, ex.: "Não tem uma conta?" + "Cadastre-se grátis" → /register. */
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  /** Normalmente um `<AuthForm>`. */
  children: ReactNode;
}

/** Card centralizado das telas de login e cadastro: marca, subtítulo, conteúdo e link do rodapé. */
export function AuthCard({ subtitle, footerText, footerLinkLabel, footerHref, children }: AuthCardProps) {
  return (
    <PageContainer width="sm" paddingY="xl" gap="none">
      <div className={styles.card}>
        <div className={styles.brand}>
          <KeyRound size={32} className={styles.brandIcon} />
          <h1 className={styles.brandName}>Keystation</h1>
        </div>
        <p className={styles.subtitle}>{subtitle}</p>

        {children}

        <div className={styles.footer}>
          <span>{footerText}</span>
          <Link href={footerHref}>{footerLinkLabel}</Link>
        </div>
      </div>
    </PageContainer>
  );
}

/** `<form>` com o espaçamento padrão entre campos dos formulários de autenticação. */
export function AuthForm({ className, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form className={[styles.form, className].filter(Boolean).join(" ")} {...props} />;
}
