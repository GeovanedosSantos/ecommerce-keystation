import { ShieldCheck, PlusCircle, DollarSign, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { FormField } from "@/components/ui/FormField/FormField";
import styles from "./admin.module.css";

export default function AdminDashboardPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          <ShieldCheck size={28} /> Painel Administrativo
        </h1>
        <p>Gerenciamento de vendas, faturamento e cadastro de novos jogos e chaves digitais.</p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <DollarSign size={24} className={styles.metricIcon} />
          <div>
            <span>Faturamento Total</span>
            <h2>R$ 24.890,00</h2>
          </div>
        </div>
        <div className={styles.metricCard}>
          <Package size={24} className={styles.metricIcon} />
          <div>
            <span>Jogos Cadastrados</span>
            <h2>48</h2>
          </div>
        </div>
        <div className={styles.metricCard}>
          <Users size={24} className={styles.metricIcon} />
          <div>
            <span>Clientes Registrados</span>
            <h2>312</h2>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Cadastrar Novo Jogo</h2>
        </div>

        <form className={styles.form}>
          <div className={styles.row}>
            <FormField label="Título do Jogo">
              <input type="text" placeholder="Ex: Grand Theft Auto VI" />
            </FormField>
            <FormField label="Desenvolvedora">
              <input type="text" placeholder="Ex: Rockstar Games" />
            </FormField>
          </div>

          <div className={styles.row}>
            <FormField label="Preço (R$)">
              <input type="number" step="0.01" placeholder="299.99" />
            </FormField>
            <FormField label="Preço Promocional (R$)">
              <input type="number" step="0.01" placeholder="199.99" />
            </FormField>
          </div>

          <FormField label="URL da Imagem de Capa">
            <input type="text" placeholder="https://..." />
          </FormField>

          <FormField label="Descrição Completa">
            <textarea rows={4} placeholder="Sinopse e detalhes do jogo..." />
          </FormField>

          <Button type="submit" inline>
            <PlusCircle size={18} /> Cadastrar Jogo & Gerar Chaves
          </Button>
        </form>
      </div>
    </div>
  );
}
