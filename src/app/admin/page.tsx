import { ShieldCheck, PlusCircle, DollarSign, Package, Users } from "lucide-react";
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
            <div className={styles.field}>
              <label>Título do Jogo</label>
              <input type="text" placeholder="Ex: Grand Theft Auto VI" />
            </div>
            <div className={styles.field}>
              <label>Desenvolvedora</label>
              <input type="text" placeholder="Ex: Rockstar Games" />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Preço (R$)</label>
              <input type="number" step="0.01" placeholder="299.99" />
            </div>
            <div className={styles.field}>
              <label>Preço Promocional (R$)</label>
              <input type="number" step="0.01" placeholder="199.99" />
            </div>
          </div>

          <div className={styles.field}>
            <label>URL da Imagem de Capa</label>
            <input type="text" placeholder="https://..." />
          </div>

          <div className={styles.field}>
            <label>Descrição Completa</label>
            <textarea rows={4} placeholder="Sinopse e detalhes do jogo..." />
          </div>

          <button type="submit" className={styles.submitBtn}>
            <PlusCircle size={18} /> Cadastrar Jogo & Gerar Chaves
          </button>
        </form>
      </div>
    </div>
  );
}
