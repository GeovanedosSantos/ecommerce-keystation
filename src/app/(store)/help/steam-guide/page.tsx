import { HelpCircle } from "lucide-react";
import { HelpPage, HelpSteps, HelpStep } from "@/components/ui/HelpPage/HelpPage";

export default function SteamGuidePage() {
  return (
    <HelpPage
      icon={<HelpCircle size={28} />}
      title="Como Resgatar sua Chave na Steam"
      subtitle="Siga o passo a passo abaixo para ativar seu jogo em poucos segundos na plataforma Steam."
    >
      <HelpSteps>
        <HelpStep number={1} title="Abra o aplicativo da Steam">
          Faça login na sua conta Steam instalada em seu computador PC ou Mac.
        </HelpStep>
        <HelpStep number={2} title="Vá em &quot;Adicionar um Jogo&quot;">
          No canto inferior esquerdo da janela do aplicativo Steam, clique em &quot;Adicionar um Jogo...&quot; e depois selecione &quot;Ativar um produto no Steam...&quot;.
        </HelpStep>
        <HelpStep number={3} title="Insira sua Chave Digital">
          Copie a chave digital direto do seu <strong>Cofre Keystation</strong>, cole no campo de código de produto e siga as instruções na tela.
        </HelpStep>
        <HelpStep number={4} title="Pronto! Inicie o Download">
          O jogo será adicionado à sua Biblioteca Steam permanentemente e você já poderá iniciar o download.
        </HelpStep>
      </HelpSteps>
    </HelpPage>
  );
}
