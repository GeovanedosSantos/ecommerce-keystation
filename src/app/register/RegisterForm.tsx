"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import styles from "../login/auth.module.css";
import { registerAction, type RegisterFormState } from "./actions";

const initialState: RegisterFormState = {
  fieldErrors: {},
  values: { fullName: "", email: "" },
};

const errorStyle = { color: "#f87171", fontSize: "0.85rem", marginTop: "4px" };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <span role="alert" style={errorStyle}>
      {messages[0]}
    </span>
  );
}

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.field}>
        <label htmlFor="fullName">Nome Completo</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Seu nome"
          defaultValue={state.values.fullName}
          autoComplete="name"
        />
        <FieldError messages={state.fieldErrors.fullName} />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seu.email@exemplo.com"
          defaultValue={state.values.email}
          autoComplete="email"
        />
        <FieldError messages={state.fieldErrors.email} />
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <FieldError messages={state.fieldErrors.password} />
      </div>

      <div className={styles.field}>
        <label htmlFor="confirmPassword">Confirmar Senha</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <FieldError messages={state.fieldErrors.confirmPassword} />
      </div>

      <div className={styles.checkboxField}>
        <input type="checkbox" id="terms" name="acceptedTerms" />
        <label htmlFor="terms">
          Li e concordo com os <Link href="/help/terms">Termos de Serviço</Link>
        </label>
      </div>
      <FieldError messages={state.fieldErrors.acceptedTerms} />

      <button type="submit" className={styles.submitBtn} disabled={pending}>
        <UserPlus size={18} /> {pending ? "Criando conta..." : "Criar Conta"}
      </button>
    </form>
  );
}