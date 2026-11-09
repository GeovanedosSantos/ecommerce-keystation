"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Lock, Mail, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./forgot-password.module.css";

export function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulação da solicitação de recuperação de senha
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  }

  function handleReset() {
    setIsSubmitted(false);
    setEmail("");
  }

  return (
    <div className={styles.forgotPassword}>
      {/* Card Principal */}
      <div className={styles.forgotPassword__card}>
        {/* Ícone de Cadeado em Caixa Roxo Translúcido */}
        <div className={styles.forgotPassword__iconWrapper} aria-hidden="true">
          <Lock size={22} />
        </div>

        {/* Cabeçalho */}
        <div className={styles.forgotPassword__header}>
          <h1 className={styles.forgotPassword__title}>Esqueceu sua senha?</h1>
          <p className={styles.forgotPassword__description}>
            Insira seu e-mail para receber um link de redefinição.
          </p>
        </div>

        {/* Formulário ou Feedback de Sucesso */}
        {isSubmitted ? (
          <div className={styles.forgotPassword__successState} role="status">
            <div className={styles.forgotPassword__successTitle}>
              <CheckCircle2 size={20} />
              <span>Link enviado com sucesso!</span>
            </div>
            <p className={styles.forgotPassword__successText}>
              Enviamos as instruções para <strong>{email}</strong>. Caso não
              encontre na caixa de entrada, certifique-se de conferir sua pasta de spam.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className={styles.forgotPassword__resendBtn}
            >
              Tentar outro e-mail
            </button>
          </div>
        ) : (
          <form className={styles.forgotPassword__form} onSubmit={handleSubmit}>
            <div className={styles.forgotPassword__field}>
              <label htmlFor="email-input" className={styles.forgotPassword__label}>
                E-mail
              </label>
              <div className={styles.forgotPassword__inputWrapper}>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rafael.costa@example.com"
                  className={styles.forgotPassword__input}
                  autoComplete="email"
                />
                <Mail
                  size={18}
                  className={styles.forgotPassword__inputIcon}
                  aria-hidden="true"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className={styles.forgotPassword__submitBtn}
            >
              <Send size={18} aria-hidden="true" />
              <span>{isLoading ? "Enviando..." : "Enviar Link"}</span>
            </Button>
          </form>
        )}

        {/* Nota Auxiliar */}
        <p className={styles.forgotPassword__note}>
          Se houver uma conta para este e-mail, enviaremos as instruções. Confira
          também a caixa de spam.
        </p>

        {/* Divisor */}
        <div className={styles.forgotPassword__divider} />

        {/* Voltar ao Login */}
        <Link href="/login" className={styles.forgotPassword__backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Voltar ao login</span>
        </Link>
      </div>

      {/* Rodapé Externo de Segurança */}
      <div className={styles.forgotPassword__footerNote}>
        <Lock size={14} className={styles.forgotPassword__footerIcon} aria-hidden="true" />
        <span>Sua biblioteca começa aqui · KeyStation</span>
      </div>
    </div>
  );
}
