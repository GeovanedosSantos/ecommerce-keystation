import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { PageContainer } from "../PageContainer/PageContainer";
import styles from "./HelpPage.module.css";

interface HelpPageProps {
  title: ReactNode;
  /** Ícone antes do título (ex.: `<ShieldCheck size={28} />`). */
  icon?: ReactNode;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Normalmente `<HelpContent>` ou `<HelpSteps>`. */
  children: ReactNode;
}

/** Página informativa (termos, reembolso, tutorial): link de voltar + card com título e subtítulo. */
export function HelpPage({
  title,
  icon,
  subtitle,
  backHref = "/",
  backLabel = "Voltar para a Loja",
  children,
}: HelpPageProps) {
  return (
    <PageContainer width="lg" gap="sm">
      <Link href={backHref} className={styles.backLink}>
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <div className={styles.card}>
        <h1 className={styles.title}>
          {icon}
          {title}
        </h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </PageContainer>
  );
}

/** Texto corrido: use `<h3>` para os títulos e `<p>` para os parágrafos. */
export function HelpContent({ children }: { children: ReactNode }) {
  return <div className={styles.content}>{children}</div>;
}

export function HelpSteps({ children }: { children: ReactNode }) {
  return <div className={styles.steps}>{children}</div>;
}

export function HelpStep({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className={styles.step}>
      <span className={styles.stepNumber}>{number}</span>
      <div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
