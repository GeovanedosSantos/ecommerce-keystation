"use client";

import { useActionState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AuthForm } from "@/components/ui/AuthCard/AuthCard";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import styles from "./register.module.css";
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
    <AuthForm action={formAction}>
      <div>
        <FormField label="Nome Completo">
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Seu nome"
            defaultValue={state.values.fullName}
            autoComplete="name"
          />
        </FormField>
        <FieldError messages={state.fieldErrors.fullName} />
      </div>

      <div>
        <FormField label="E-mail">
          <input
            id="email"
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
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FormField>
        <FieldError messages={state.fieldErrors.password} />
      </div>

      <div>
        <FormField label="Confirmar Senha">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </FormField>
        <FieldError messages={state.fieldErrors.confirmPassword} />
      </div>

      <div className={styles.checkboxField}>
        <input type="checkbox" id="terms" name="acceptedTerms" />
        <label htmlFor="terms">
          Li e concordo com os <Link href="/help/terms">Termos de Serviço</Link>
        </label>
      </div>
      <FieldError messages={state.fieldErrors.acceptedTerms} />

      <Button type="submit" disabled={pending}>
        <UserPlus size={18} /> {pending ? "Criando conta..." : "Criar Conta"}
      </Button>
    </AuthForm>
  );
}
