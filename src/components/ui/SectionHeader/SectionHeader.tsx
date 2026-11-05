import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./SectionHeader.module.css";

interface SectionHeaderProps {
  title: ReactNode;
  /** Ícone antes do título (ex.: `<Compass size={24} />`). */
  icon?: ReactNode;
  /** `primary` pinta o ícone de roxo; `inherit` usa a cor do título. */
  iconColor?: "primary" | "inherit";
  /** `section` = h2 de seção; `page` = h1 de página. */
  level?: "section" | "page";
  /** Texto de apoio abaixo do título. */
  description?: ReactNode;
  /** Link à direita (ex.: "Ver todos"). */
  linkHref?: string;
  linkLabel?: string;
  linkIcon?: ReactNode;
  /** Conteúdo livre à direita (ex.: um `<select>` de ordenação). Aparece depois do link. */
  children?: ReactNode;
}

export function SectionHeader({
  title,
  icon,
  iconColor = "inherit",
  level = "section",
  description,
  linkHref,
  linkLabel,
  linkIcon,
  children,
}: SectionHeaderProps) {
  const Heading = level === "page" ? "h1" : "h2";
  const titleClass = `${styles.title} ${level === "page" ? styles.pageTitle : styles.sectionTitle}`;

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <Heading className={titleClass}>
          {icon && <span className={iconColor === "primary" ? styles.iconPrimary : undefined}>{icon}</span>}
          {title}
        </Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      {linkHref && linkLabel && (
        <Link href={linkHref} className={styles.link}>
          {linkLabel} {linkIcon}
        </Link>
      )}
      {children}
    </div>
  );
}
