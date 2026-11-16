import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { HelpPage, HelpContent } from "@/components/ui/HelpPage/HelpPage";

export default function TermsPage() {
  return (
    <HelpPage
      icon={<ShieldCheck size={28} />}
      title="Termos de Serviço — Ecommerce Keystation"
      subtitle="Última atualização: Outubro de 2026 | Projeto A3 (Usabilidade, Desenvolvimento Web, Mobile e Jogos)"
    >
      <HelpContent>
        <h3>1. Visão Geral e Aceitação</h3>
        <p>
          Bem-vindo ao <strong>Ecommerce Keystation</strong>. Estes Termos de Serviço regem o uso do nosso website, plataforma de comércio eletrônico de chaves digitais de jogos para PC e serviços associados. Ao acessar ou utilizar nossa plataforma, você concorda integralmente com estes termos.
        </p>

        <h3>2. Natureza dos Produtos (Chaves Digitais)</h3>
        <p>
          O Keystation comercializa chaves de ativação digital (Product Keys/CD-Keys) para plataformas oficiais de jogos, como a Steam. As chaves são entregues de forma digital e instantânea diretamente no painel do usuário (&quot;Cofre&quot;) após a confirmação do pagamento.
        </p>

        <h3>3. Cadastro e Segurança da Conta</h3>
        <p>
          Para realizar compras e armazenar suas chaves digitais, você deve criar uma conta fornecendo informações precisas e verídicas. O usuário é o único responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
        </p>

        <h3>4. Política de Pagamentos e Aprovação</h3>
        <p>
          Aceitamos métodos de pagamento seguros, incluindo Pix (com aprovação e liberação instantânea), Cartão de Crédito e Boleto Bancário. As chaves digitais somente são liberadas no cofre após a compensação e aprovação bem-sucedida do pagamento pela instituição financeira.
        </p>

        <h3>5. Propriedade Intelectual</h3>
        <p>
          Todas as marcas, logotipos, imagens de capas de jogos, títulos e artes exibidas na plataforma pertencem aos seus respectivos desenvolvedores e publicadoras (ex: CD Projekt Red, FromSoftware, Rockstar Games, Larian Studios). O Keystation atua como revendedor autorizado de chaves digitais.
        </p>

        <h3>6. Suporte e Contato</h3>
        <p>
          Em caso de dúvidas sobre resgate, ativação ou problemas com chaves digitais, entre em contato conosco através da nossa <Link href="/support" style={{ color: "var(--secondary)", textDecoration: "underline" }}>Central de Suporte</Link>.
        </p>
      </HelpContent>
    </HelpPage>
  );
}
