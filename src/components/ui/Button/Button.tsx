import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "success" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

interface BaseProps {
  variant?: Variant;
  /** Largura ajustada ao conteúdo, em vez de ocupar toda a linha. */
  inline?: boolean;
  className?: string;
  children: ReactNode;
}

/** `size="icon"` não tem texto visível, então exige `aria-label`. */
type SizeProps =
  | { size?: Exclude<Size, "icon">; "aria-label"?: string }
  | { size: "icon"; "aria-label": string };

type ButtonAsButton = BaseProps &
  SizeProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps | "aria-label"> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & SizeProps & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { href, variant, size, inline, className, children } = props;
    return (
      <Link
        href={href}
        className={buildClassName(variant, size, inline, className)}
        aria-label={props["aria-label"]}
      >
        {children}
      </Link>
    );
  }

  const { variant, size, inline, className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={buildClassName(variant, size, inline, className)} {...rest}>
      {children}
    </button>
  );
}

function buildClassName(
  variant: Variant = "primary",
  size: Size = "lg",
  inline = false,
  className = "",
) {
  return [styles.button, styles[variant], styles[size], inline ? styles.inline : "", className]
    .filter(Boolean)
    .join(" ");
}
