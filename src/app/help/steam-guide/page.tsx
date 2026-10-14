import Link from "next/link";
import { HelpCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import styles from "../help.module.css";

export default function SteamGuidePage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} /> Voltar para a Loja
      </Link>

      <div className={styles.card}>
        <h1><HelpCircle size={28} /> Como Resgatar sua Chave na Steam</h1>
        <p className={styles.subtitle}>Siga o passo a passo abaixo para ativar seu jogo em poucos segundos na plataforma Steam.</p>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div>
              <h3>Abra o aplicativo da Steam</h3>
              <p>Faça login na sua conta Steam instalada em seu computador PC ou Mac.</p>
            </div>
          </div>

          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div>
              <h3>Vá em &quot;Adicionar um Jogo&quot;</h3>
              <p>No canto inferior esquerdo da janela do aplicativo Steam, clique em &quot;Adicionar um Jogo...&quot; e depois selecione &quot;Ativar um produto no Steam...&quot;.</p>
            </div>
          </div>

          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div>
              <h3>Insira sua Chave Digital</h3>
              <p>Copie a chave digital direto do seu <strong>Cofre Keystation</strong>, cole no campo de código de produto e siga as instruções na tela.</p>
            </div>
          </div>

          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div>
              <h3>Pronto! Inicie o Download</h3>
              <p>O jogo será adicionado à sua Biblioteca Steam permanentemente e você já poderá iniciar o download.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
