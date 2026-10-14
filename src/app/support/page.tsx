import { Headphones, Send, Mail, MessageSquare } from "lucide-react";
import styles from "./support.module.css";

export default function SupportPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <Headphones size={28} /> Central de Suporte & Atendimento
        </h1>
        <p>Precisa de ajuda com alguma chave ou pagamento? Nossa equipe está pronta para ajudar.</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.formCard}>
          <h2>Enviar Nova Mensagem</h2>
          
          <form className={styles.form}>
            <div className={styles.field}>
              <label>Nome Completo</label>
              <input type="text" placeholder="Seu nome" />
            </div>

            <div className={styles.field}>
              <label>E-mail</label>
              <input type="email" placeholder="seu.email@exemplo.com" />
            </div>

            <div className={styles.field}>
              <label>Assunto</label>
              <select defaultValue="chave">
                <option value="chave">Problema com Chave Digital</option>
                <option value="pagamento">Dúvida sobre Pagamento / Pix</option>
                <option value="reembolso">Solicitação de Reembolso</option>
                <option value="outro">Outro Assunto</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Mensagem</label>
              <textarea rows={5} placeholder="Descreva sua dúvida ou problema detalhadamente..." />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Send size={18} /> Enviar Solicitação
            </button>
          </form>
        </div>

        <div className={styles.infoCol}>
          <div className={styles.infoCard}>
            <Mail size={24} className={styles.infoIcon} />
            <div>
              <h3>E-mail de Contato</h3>
              <p>suporte@keystation.com.br</p>
              <span>Respondemos em até 2 horas</span>
            </div>
          </div>

          <div className={styles.infoCard}>
            <MessageSquare size={24} className={styles.infoIcon} />
            <div>
              <h3>Chat ao Vivo (Discord / WhatsApp)</h3>
              <p>Disponível 24/7 para clientes</p>
              <span>Atendimento humanizado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
