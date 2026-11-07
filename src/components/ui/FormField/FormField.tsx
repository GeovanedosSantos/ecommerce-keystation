import type { ReactNode } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  /** O controle: `<input>`, `<select>` ou `<textarea>`. */
  children: ReactNode;
  className?: string;
}

/** Rótulo + controle. O `<label>` envolve o controle, então os dois ficam associados. */
export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(" ")}>
      <span className={styles.label}>{label}</span>
      {children}
    </label>
  );
}
