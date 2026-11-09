import type { Metadata } from "next";
import { ForgotPasswordContent } from "./ForgotPasswordContent";

export const metadata: Metadata = {
  title: "Recuperar Senha | KeyStation",
  description: "Insira seu e-mail para receber um link de redefinição de senha no KeyStation.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
