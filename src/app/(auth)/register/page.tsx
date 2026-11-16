import { AuthCard } from "@/components/ui/AuthCard/AuthCard";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      subtitle="Crie sua conta e ganhe acesso instantâneo ao cofre de chaves."
      footerText="Já tem uma conta?"
      footerLinkLabel="Faça login"
      footerHref="/login"
    >
      <RegisterForm />
    </AuthCard>
  );
}
