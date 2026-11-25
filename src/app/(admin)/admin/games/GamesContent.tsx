"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  ImagePlus,
  Info,
  Save,
  Plus,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import styles from "../admin.module.css";

export function GamesContent() {
  // Estados do formulário de cadastro de jogos para prévia ao vivo
  const [gameTitle, setGameTitle] = useState("Neon Drift");
  const [gameCategory, setGameCategory] = useState("Ação · Corrida");
  const [gamePrice, setGamePrice] = useState("R$ 120,00");
  const [gameDescription, setGameDescription] = useState(
    "Domine as ruas de uma metrópole neon. Ajuste seu carro, desafie circuitos urbanos e encontre a linha perfeita em uma experiência de corrida arcade."
  );
  const [gameDeveloper, setGameDeveloper] = useState("Neon Forge Studio");
  const [gamePlatform, setGamePlatform] = useState("Steam");
  const [gameRegion, setGameRegion] = useState("Brasil");
  const [compatWindows, setCompatWindows] = useState(true);
  const [compatMac, setCompatMac] = useState(true);

  const [notification, setNotification] = useState<string | null>(null);

  function handleSave(action: string) {
    setNotification(action);
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className={styles.contentArea}>
      {notification && (
        <div className={styles.notificationBanner}>
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {/* Cabeçalho da Seção */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTextGroup}>
          <span className={styles.sectionBadge}>CATÁLOGO / NOVO JOGO</span>
          <h1 className={styles.sectionTitle}>Cadastro de Jogos</h1>
          <p className={styles.sectionSubtitle}>
            Organize as informações e a apresentação do produto antes de publicar.
          </p>
        </div>
      </div>

      {/* Layout em 2 Colunas */}
      <div className={styles.gamesLayout}>
        {/* Coluna da Esquerda: Formulários */}
        <div className={styles.formColumn}>
          {/* 1. Informações do jogo */}
          <div className={styles.formCard}>
            <div className={styles.cardHeaderWithBadge}>
              <h3 className={styles.cardTitleH3}>Informações do jogo</h3>
              <span className={styles.draftBadge}>RASCUNHO</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="game-title" className={styles.inputLabel}>
                Título do jogo
              </label>
              <input
                id="game-title"
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className={styles.inputField}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="game-desc" className={styles.inputLabel}>
                Descrição
              </label>
              <textarea
                id="game-desc"
                rows={4}
                value={gameDescription}
                onChange={(e) => setGameDescription(e.target.value)}
                className={`${styles.inputField} ${styles.textareaField}`}
              />
            </div>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="game-dev" className={styles.inputLabel}>
                  Desenvolvedora
                </label>
                <input
                  id="game-dev"
                  type="text"
                  value={gameDeveloper}
                  onChange={(e) => setGameDeveloper(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="game-cat" className={styles.inputLabel}>
                  Categoria
                </label>
                <select
                  id="game-cat"
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value)}
                  className={styles.inputField}
                >
                  <option>Ação · Corrida</option>
                  <option>Ação · RPG</option>
                  <option>Aventura</option>
                  <option>Estratégia</option>
                  <option>Indie</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Preço e ativação */}
          <div className={styles.formCard}>
            <h3 className={styles.cardTitleH3}>Preço e ativação</h3>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="sale-price" className={styles.inputLabel}>
                  Preço de venda
                </label>
                <input
                  id="sale-price"
                  type="text"
                  value={gamePrice}
                  onChange={(e) => setGamePrice(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="orig-price" className={styles.inputLabel}>
                  Preço original (opcional)
                </label>
                <input
                  id="orig-price"
                  type="text"
                  placeholder="Digite para criar uma oferta"
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="platform" className={styles.inputLabel}>
                  Plataforma
                </label>
                <select
                  id="platform"
                  value={gamePlatform}
                  onChange={(e) => setGamePlatform(e.target.value)}
                  className={styles.inputField}
                >
                  <option>Steam</option>
                  <option>Epic Games</option>
                  <option>GOG</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="region" className={styles.inputLabel}>
                  Região de ativação
                </label>
                <select
                  id="region"
                  value={gameRegion}
                  onChange={(e) => setGameRegion(e.target.value)}
                  className={styles.inputField}
                >
                  <option>Brasil</option>
                  <option>Global</option>
                  <option>América Latina</option>
                </select>
              </div>
            </div>

            <div className={styles.compatSection}>
              <span className={styles.inputLabel}>Sistemas compatíveis</span>
              <div className={styles.compatOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={compatWindows}
                    onChange={(e) => setCompatWindows(e.target.checked)}
                  />
                  <span>Windows</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={compatMac}
                    onChange={(e) => setCompatMac(e.target.checked)}
                  />
                  <span>macOS</span>
                </label>
              </div>
              <span className={styles.compatNote}>
                Confirme a compatibilidade e os requisitos antes da publicação.
              </span>
            </div>
          </div>

          {/* 3. Imagens do produto */}
          <div className={styles.formCard}>
            <h3 className={styles.cardTitleH3}>Imagens do produto</h3>

            <div className={styles.dropzone}>
              <ImagePlus size={36} className={styles.dropzoneIcon} />
              <span className={styles.dropzoneTitle}>
                Arraste suas imagens aqui
              </span>
              <span className={styles.dropzoneNote}>
                JPG ou PNG · Até 5 MB por arquivo
              </span>
              <button type="button" className={styles.selectFilesBtn}>
                Selecionar arquivos
              </button>
            </div>

            <div className={styles.uploadedFileList}>
              <div className={styles.uploadedFileItem}>
                <div className={styles.uploadedFileLeft}>
                  <Image
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop"
                    alt="Prévia Neon Drift"
                    width={44}
                    height={32}
                    className={styles.uploadedFileThumb}
                  />
                  <div className={styles.uploadedFileInfo}>
                    <span className={styles.uploadedFileName}>
                      neon-drift-capa.jpg
                    </span>
                    <span className={styles.uploadedFileMeta}>
                      Imagem principal · 1,8 MB · Exemplo
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.deleteFileBtn}
                  aria-label="Remover imagem"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Barra de Ações */}
          <div className={styles.formActionBar}>
            <Link href="/admin" className={styles.cancelActionBtn}>
              Cancelar
            </Link>

            <div className={styles.actionRightButtons}>
              <button
                type="button"
                className={styles.draftActionBtn}
                onClick={() => handleSave("Rascunho salvo com sucesso!")}
              >
                <Save size={16} />
                <span>Salvar rascunho</span>
              </button>

              <button
                type="button"
                className={styles.publishActionBtn}
                onClick={() => handleSave("Jogo cadastrado com sucesso!")}
              >
                <Plus size={16} />
                <span>Cadastrar jogo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Prévia do Card e Checklist */}
        <div className={styles.previewColumn}>
          {/* Prévia do Card */}
          <div className={styles.previewWrapperCard}>
            <h3 className={styles.previewHeaderTitle}>Prévia do card</h3>
            <span className={styles.previewHeaderNote}>
              Assim o jogo aparecerá no catálogo
            </span>

            <div className={styles.livePreviewCard}>
              <div className={styles.livePreviewBanner}>
                <Image
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"
                  alt={gameTitle}
                  fill
                  className={styles.livePreviewImg}
                />
                <span className={styles.livePreviewTagNeon}>
                  {gameTitle.toUpperCase()}
                </span>
                <span className={styles.livePreviewPlatform}>
                  {gamePlatform.toUpperCase()}
                </span>
              </div>

              <div className={styles.livePreviewBody}>
                <span className={styles.livePreviewCategory}>
                  {gameCategory}
                </span>
                <h4 className={styles.livePreviewTitle}>{gameTitle}</h4>
                <span className={styles.livePreviewSub}>Chave digital</span>

                <div className={styles.livePreviewPriceRow}>
                  <span className={styles.livePreviewPrice}>{gamePrice}</span>
                  <div className={styles.livePreviewCartBtn}>
                    <ShoppingCart size={16} />
                  </div>
                </div>
              </div>
            </div>

            <span className={styles.notPublishedBadge}>NÃO PUBLICADO</span>
          </div>

          {/* Checklist de Publicação */}
          <div className={styles.checklistCard}>
            <Info size={22} className={styles.checklistIcon} />
            <div className={styles.checklistBody}>
              <h4 className={styles.checklistTitle}>Checklist de publicação</h4>
              <p className={styles.checklistText}>
                Revise descrição, preço, região, compatibilidade e imagens.
                Cadastre as chaves no estoque antes de disponibilizar a venda.
              </p>
            </div>
          </div>

          <p className={styles.previewDisclaimer}>
            {gameTitle} e sua desenvolvedora são exemplos fictícios. Nenhum
            produto foi cadastrado.
          </p>
        </div>
      </div>

      <p className={styles.adminFooterDisclaimer}>
        Dados demonstrativos · Atualizado em 05/10/2026 às 14:32
      </p>
    </div>
  );
}
