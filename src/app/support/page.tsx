import { Headphones, Send, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import styles from "./support.module.css";

export default function SupportPage() {
  return (
    <PageContainer>
      <SectionHeader
        level="page"
        icon={<Headphones size={28} />}
        title="Central de Suporte & Atendimento"
        description="Precisa de ajuda com alguma chave ou pagamento? Nossa equipe está pronta para ajudar."
      />

      <div className={styles.layout}>
        <div className={styles.formCard}>
          <h2>Enviar Nova Mensagem</h2>
          
          <form className={styles.form}>
            <FormField label="Nome Completo">
              <input type="text" placeholder="Seu nome" />
            </FormField>

            <FormField label="E-mail">
              <input type="email" placeholder="seu.email@exemplo.com" />
            </FormField>

            <FormField label="Assunto">
              <select defaultValue="chave">
              <option value="chave">Problema com Chave Digital</option>
              <option value="pagamento">Dúvida sobre Pagamento / Pix</option>
              <option value="reembolso">Solicitação de Reembolso</option>
              <option value="outro">Outro Assunto</option>
              </select>
            </FormField>

            <FormField label="Mensagem">
              <textarea rows={5} placeholder="Descreva sua dúvida ou problema detalhadamente..." />
            </FormField>

            <Button type="submit" className={styles.submitBtn}>
              <Send size={18} /> Enviar Solicitação
            </Button>
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
    </PageContainer>
  );
}
