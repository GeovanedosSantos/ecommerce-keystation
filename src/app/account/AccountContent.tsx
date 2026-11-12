"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  User,
  ScrollText,
  KeyRound,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Pencil,
  Save,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import styles from "./account.module.css";

export function AccountContent() {
  const [name, setName] = useState("Rafael Costa");
  const [email] = useState("rafael.costa@example.com");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3500);
  }

  function handleCancel() {
    setName("Rafael Costa");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSavedSuccess(false);
  }

  return (
    <PageContainer>
      <div className={styles.accountPage}>
        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className={styles.breadcrumb}>
          <Link href="/">Início</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/account">Minha conta</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>Meus Dados</span>
        </nav>

        {/* Cabeçalho */}
        <div className={styles.header}>
          <h1 className={styles.title}>Minha conta</h1>
          <p className={styles.subtitle}>
            Seu perfil, seus pedidos e suas próximas aventuras.
          </p>
        </div>

        {/* Grid de 2 Colunas */}
        <div className={styles.grid}>
          {/* Coluna da Esquerda: Sidebar do Perfil */}
          <aside className={styles.userSidebar} aria-label="Menu da Conta">
            <div className={styles.userProfileSnippet}>
              <div className={styles.avatarLarge}>RC</div>
              <div>
                <h2 className={styles.userName}>{name}</h2>
                <span className={styles.userMemberSince}>
                  Membro desde setembro de 2026
                </span>
              </div>
            </div>

            <nav className={styles.navMenu}>
              <Link
                href="/account"
                className={`${styles.navItem} ${styles.navItemActive}`}
              >
                <User size={18} />
                <span>Meus Dados</span>
              </Link>

              <Link href="/account/orders" className={styles.navItem}>
                <ScrollText size={18} />
                <span>Meus Pedidos</span>
              </Link>

              <Link href="/account/vault" className={styles.navItem}>
                <KeyRound size={18} />
                <span>Minhas Chaves</span>
              </Link>

              <div className={styles.navDivider} />

              <Link
                href="/login"
                className={`${styles.navItem} ${styles.navItemLogout}`}
              >
                <LogOut size={18} />
                <span>Sair</span>
              </Link>
            </nav>
          </aside>

          {/* Coluna da Direita: Painel Principal */}
          <main className={styles.mainContent}>
            {savedSuccess && (
              <div className={styles.successToast} role="status">
                <CheckCircle2 size={18} />
                <span>Alterações salvas com sucesso!</span>
              </div>
            )}

            <div className={styles.mainCard}>
              {/* Topo do Card */}
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Meus Dados</h2>
                <span className={styles.editBadge}>Modo de Edição</span>
              </div>

              {/* Seção de Avatar */}
              <div className={styles.avatarSection}>
                <div className={styles.avatarLeft}>
                  <div className={styles.avatarBig}>RC</div>
                  <div className={styles.avatarMeta}>
                    <span className={styles.avatarName}>{name}</span>
                    <span className={styles.avatarRules}>JPG ou PNG · Até 2 MB</span>
                  </div>
                </div>

                <button type="button" className={styles.avatarChangeBtn}>
                  <Camera size={16} />
                  <span>Alterar avatar</span>
                </button>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSave} className={styles.accountPage}>
                {/* Linha 1: Nome Completo e E-mail */}
                <div className={styles.formGrid2}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="name-input" className={styles.fieldLabel}>
                      Nome completo
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.inputField}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="email-input" className={styles.fieldLabel}>
                      E-mail
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      readOnly
                      className={styles.inputField}
                    />
                  </div>
                </div>

                <span className={styles.helperText}>
                  Dados ilustrativos · Conta criada em 15/09/2026
                </span>

                {/* Seção de Alterar Senha */}
                <div className={styles.passwordSection}>
                  <h3 className={styles.passwordTitle}>Alterar senha</h3>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="current-pass" className={styles.fieldLabel}>
                      Senha atual
                    </label>
                    <div className={styles.inputWrapper}>
                      <input
                        id="current-pass"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`${styles.inputField} ${styles.inputFieldWithIcon}`}
                      />
                      <button
                        type="button"
                        className={styles.iconToggleBtn}
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Ocultar senha" : "Exibir senha"}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="new-pass" className={styles.fieldLabel}>
                        Nova senha
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          id="new-pass"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Digite uma nova senha"
                          className={`${styles.inputField} ${styles.inputFieldWithIcon}`}
                        />
                        <button
                          type="button"
                          className={styles.iconToggleBtn}
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? "Ocultar senha" : "Exibir senha"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="confirm-pass" className={styles.fieldLabel}>
                        Confirmar nova senha
                      </label>
                      <div className={styles.inputWrapper}>
                        <input
                          id="confirm-pass"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Digite novamente"
                          className={`${styles.inputField} ${styles.inputFieldWithIcon}`}
                        />
                        <button
                          type="button"
                          className={styles.iconToggleBtn}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <span className={styles.helperText}>
                    Deixe os campos de nova senha vazios para manter sua senha atual.
                  </span>
                </div>

                {/* Barra de Ações */}
                <div className={styles.actionsBar}>
                  <div className={styles.actionsLeft}>
                    <button type="button" className={styles.editModeButton}>
                      <Pencil size={16} />
                      <span>Editar Dados</span>
                    </button>
                    <span className={styles.editHint}>
                      Você está editando seus dados. As alterações ainda não foram salvas.
                    </span>
                  </div>

                  <div className={styles.actionsRight}>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={styles.cancelBtn}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className={styles.saveBtn}>
                      <Save size={16} />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Card de Aviso / Segurança */}
            <div className={styles.securityCard}>
              <ShieldCheck size={22} className={styles.securityIcon} />
              <div className={styles.securityBody}>
                <h4 className={styles.securityTitle}>
                  Cuide do acesso à sua conta
                </h4>
                <p className={styles.securityText}>
                  Use uma senha exclusiva e não compartilhe seus códigos de ativação. A
                  KeyStation não solicita sua senha pelo suporte.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
