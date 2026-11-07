import { AuthCard } from "@/components/ui/AuthCard/AuthCard";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      subtitle="Entre na sua conta para acessar seu cofre e pedidos."
      footerText="Não tem uma conta?"
      footerLinkLabel="Cadastre-se grátis"
      footerHref="/register"
    >
      <LoginForm />
    </AuthCard>
  );
}
