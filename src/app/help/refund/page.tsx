import { ShieldCheck } from "lucide-react";
import { HelpPage, HelpContent } from "@/components/ui/HelpPage/HelpPage";

export default function RefundPage() {
  return (
    <HelpPage
      icon={<ShieldCheck size={28} />}
      title="Política de Reembolso"
      subtitle="Garantia e regras de reembolso do Ecommerce Keystation"
    >
      <HelpContent>
        <h3>1. Condições para Reembolso</h3>
        <p>O reembolso pode ser solicitado em até 7 dias corridos após a compra, desde que a chave digital <strong>ainda não tenha sido revelada</strong> no cofre do cliente.</p>

        <h3>2. Chaves com Defeito</h3>
        <p>Caso a chave digital apresente qualquer falha de ativação comprovada, nossa equipe efetuará a substituição imediata ou o reembolso integral do valor pago após análise do suporte.</p>
      </HelpContent>
    </HelpPage>
  );
}
