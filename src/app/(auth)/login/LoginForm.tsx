"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { AuthForm } from "@/components/ui/AuthCard/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import { loginAction, type LoginFormState } from "./actions";
import  Link from "next/link"
import styles from  "./login.module.css"

const initialState: LoginFormState = {
  fieldErrors: {},
  values: { email: "" },
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

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <AuthForm action={formAction}>
      {state.formError && (
        <p role="alert" style={errorStyle}>
          {state.formError}
        </p>
      )}

      <div>
        <FormField label="E-mail">
          <input
            name="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            defaultValue={state.values.email}
            autoComplete="email"
          />
        </FormField>
        <FieldError messages={state.fieldErrors.email} />
      </div>

      <div>
        <FormField label="Senha">
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </FormField>
        <FieldError messages={state.fieldErrors.password} />
      </div>

        <div className={styles.forgotPasswordRow}>
          <Link href="/forgot-password" className={styles.forgotPasswordLink}>
            Esqueceu sua senha?
          </Link>
        </div>

      <Button type="submit" disabled={pending}>
        <LogIn size={18} /> {pending ? "Entrando..." : "Entrar na Conta"}
      </Button>
    </AuthForm>
  );
}
