"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Trash2,
  ImagePlus,
  Info,
  Save,
  Plus,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Upload,
  Star,
} from "lucide-react";
import type {
  AdminProductDetail,
  CatalogOptions,
} from "@/core/modules/product/types";
import { slugify } from "@/core/modules/product/slugify";
import { parseKeyBatch } from "@/core/modules/key/schema";
import { Category, ProductStatus } from "@/generated/prisma/enums";
import {
  allocateKeysBatchAction,
  createAdminGameAction,
  updateAdminGameAction,
} from "./actions";
import styles from "../admin.module.css";

type UploadedImageItem = {
  path: string;
  label: string;
};

type GameFormProps = {
  mode: "create" | "edit";
  options: CatalogOptions;
  initialProduct?: AdminProductDetail;
  defaultReleaseDate?: string;
};

function parsePriceInput(raw: string): number {
  const normalized = raw.replace(/[^\d,.]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPricePreview(raw: string): string {
  const numeric = parsePriceInput(raw);
  return `R$ ${numeric.toFixed(2).replace(".", ",")}`;
}

export function GameForm({
  mode,
  options,
  initialProduct,
  defaultReleaseDate = "2026-01-01",
}: GameFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialVariant = initialProduct?.variants[0];

  const [category, setCategory] = useState<Category>(
    initialProduct?.category ?? Category.GAME,
  );
  const [title, setTitle] = useState(initialProduct?.title ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [baseProductId, setBaseProductId] = useState(
    initialProduct?.baseProductId ?? "",
  );
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  );
  const [developer, setDeveloper] = useState(initialProduct?.developer ?? "");
  const [publisher, setPublisher] = useState(initialProduct?.publisher ?? "");
  const [genreIds, setGenreIds] = useState<string[]>(
    initialProduct?.genres.map((g) => g.id) ?? [],
  );

  const [platformId, setPlatformId] = useState(
    initialVariant?.platformId ?? options.platforms[0]?.id ?? "",
  );
  const [priceText, setPriceText] = useState(
    initialVariant ? initialVariant.price.toFixed(2).replace(".", ",") : "99,90",
  );
  const [releaseDate, setReleaseDate] = useState(
    initialVariant?.releaseDate ?? defaultReleaseDate,
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialVariant?.status ?? ProductStatus.PUBLISHED,
  );

  const [images, setImages] = useState<UploadedImageItem[]>(() => {
    const list: UploadedImageItem[] = [];
    if (initialProduct?.coverPath) {
      list.push({ path: initialProduct.coverPath, label: "Capa principal" });
    }
    for (const item of initialProduct?.gallery ?? []) {
      if (item.path !== initialProduct?.coverPath) {
        list.push({ path: item.path, label: "Galeria" });
      }
    }
    return list;
  });
  const [coverPath, setCoverPath] = useState<string | null>(
    initialProduct?.coverPath ?? null,
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [rawKeys, setRawKeys] = useState("");
  const [keyStats, setKeyStats] = useState(
    initialVariant?.keyStats ?? { available: 0, reserved: 0, sold: 0 },
  );

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const parsedBatch = useMemo(() => parseKeyBatch(rawKeys), [rawKeys]);

  const selectedPlatformName = useMemo(() => {
    return (
      options.platforms.find((p) => p.id === platformId)?.name ?? "Plataforma"
    );
  }, [options.platforms, platformId]);

  const selectedGenreNames = useMemo(() => {
    const names = options.genres
      .filter((g) => genreIds.includes(g.id))
      .map((g) => g.name);
    return names.length > 0 ? names.slice(0, 2).join(" · ") : category;
  }, [options.genres, genreIds, category]);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited && mode === "create") {
      setSlug(slugify(value));
    }
  }

  function toggleGenre(id: string) {
    setGenreIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setFeedback(null);

    try {
      const uploaded: UploadedImageItem[] = [];

      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body,
        });

        const data = (await response.json()) as {
          path?: string;
          originalName?: string;
          error?: string;
        };

        if (!response.ok || !data.path) {
          throw new Error(data.error ?? "Falha ao enviar imagem.");
        }

        uploaded.push({
          path: data.path,
          label: data.originalName ?? file.name,
        });
      }

      setImages((prev) => {
        const next = [...prev, ...uploaded];
        if (!coverPath && uploaded[0]) {
          setCoverPath(uploaded[0].path);
        }
        return next;
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erro ao enviar imagem.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleAddImageUrl() {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;

    setImages((prev) => {
      if (prev.some((img) => img.path === trimmed)) return prev;
      return [...prev, { path: trimmed, label: "URL externa" }];
    });
    if (!coverPath) {
      setCoverPath(trimmed);
    }
    setImageUrlInput("");
  }

  function handleRemoveImage(targetPath: string) {
    setImages((prev) => {
      const next = prev.filter((img) => img.path !== targetPath);
      if (coverPath === targetPath) {
        setCoverPath(next[0]?.path ?? null);
      }
      return next;
    });
  }

  function handleAllocateKeysNow() {
    if (!initialVariant?.id) return;

    startTransition(async () => {
      setFeedback(null);
      const res = await allocateKeysBatchAction(initialVariant.id, rawKeys);
      if (!res.ok) {
        setFeedback({ type: "error", message: res.message });
        return;
      }

      setKeyStats((prev) => ({ ...prev, available: res.totalAvailable }));
      setRawKeys("");
      const duplicatesNote =
        res.duplicateKeys.length > 0
          ? ` (${res.duplicateKeys.length} duplicada(s) ignorada(s))`
          : "";
      setFeedback({
        type: "success",
        message: `${res.insertedCount} chave(s) alocada(s) no estoque${duplicatesNote}. Total disponível: ${res.totalAvailable}.`,
      });
      router.refresh();
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    if (!platformId) {
      setFeedback({
        type: "error",
        message: "Selecione uma plataforma antes de salvar.",
      });
      return;
    }

    const numericPrice = parsePriceInput(priceText);
    const activeCover = coverPath ?? images[0]?.path ?? null;
    const gallery = images
      .filter((img) => img.path !== activeCover)
      .map((img, index) => ({ path: img.path, position: index }));

    const payload = {
      category,
      title,
      slug,
      description,
      developer: developer || null,
      publisher: publisher || null,
      coverPath: activeCover,
      baseProductId: category === Category.GAME ? null : baseProductId || null,
      genreIds,
      gallery,
      variant: {
        id: initialVariant?.id,
        platformId,
        price: numericPrice,
        status,
        releaseDate,
      },
      rawKeys: mode === "create" ? rawKeys : undefined,
    };

    startTransition(async () => {
      if (mode === "create") {
        const res = await createAdminGameAction(payload);
        if (!res.ok) {
          setFeedback({ type: "error", message: res.message });
          setFieldErrors(res.fieldErrors ?? {});
          return;
        }
        router.push(`/admin/games/${res.slug}/edit`);
        router.refresh();
        return;
      }

      if (!initialProduct) return;

      const res = await updateAdminGameAction(initialProduct.slug, payload);
      if (!res.ok) {
        setFeedback({ type: "error", message: res.message });
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }

      setFeedback({
        type: "success",
        message: "Alterações salvas com sucesso!",
      });
      if (res.slug !== initialProduct.slug) {
        router.push(`/admin/games/${res.slug}/edit`);
      } else {
        router.refresh();
      }
    });
  }

  const previewCover = coverPath ?? images[0]?.path ?? "/globe.svg";
  const isPublished = status === ProductStatus.PUBLISHED;

  return (
    <form className={styles.contentArea} onSubmit={handleSubmit}>
      {feedback && (
        <div
          className={
            feedback.type === "success"
              ? styles.notificationBanner
              : styles.errorBanner
          }
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Cabeçalho */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTextGroup}>
          <span className={styles.sectionBadge}>
            CATÁLOGO / {mode === "create" ? "NOVO JOGO" : "EDITAR JOGO"}
          </span>
          <h1 className={styles.sectionTitle}>
            {mode === "create"
              ? "Cadastro de Jogo"
              : `Editar: ${initialProduct?.title}`}
          </h1>
          <p className={styles.sectionSubtitle}>
            Configure informações, imagens, preço e alocação de chaves em lote no estoque.
          </p>
        </div>
      </div>

      {options.platforms.length === 0 && (
        <div className={styles.errorBanner}>
          <AlertCircle size={16} />
          <span>
            Nenhuma plataforma cadastrada no banco. Execute o seed (`npx prisma db seed`) antes de cadastrar jogos.
          </span>
        </div>
      )}

      {/* Layout em 2 Colunas */}
      <div className={styles.gamesLayout}>
        {/* Coluna da Esquerda */}
        <div className={styles.formColumn}>
          {/* 1. Informações do jogo */}
          <div className={styles.formCard}>
            <div className={styles.cardHeaderWithBadge}>
              <h3 className={styles.cardTitleH3}>Informações do jogo</h3>
              <span className={styles.draftBadge}>
                {isPublished ? "PUBLICADO" : "RASCUNHO"}
              </span>
            </div>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="game-title" className={styles.inputLabel}>
                  Título do jogo *
                </label>
                <input
                  id="game-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ex: Elden Ring"
                  className={styles.inputField}
                />
                {fieldErrors.title && (
                  <span className={styles.fieldError}>{fieldErrors.title}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="game-slug" className={styles.inputLabel}>
                  Slug (URL amigável)
                </label>
                <input
                  id="game-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="elden-ring"
                  className={styles.inputField}
                />
                {fieldErrors.slug && (
                  <span className={styles.fieldError}>{fieldErrors.slug}</span>
                )}
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="game-category" className={styles.inputLabel}>
                  Categoria do produto
                </label>
                <select
                  id="game-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className={styles.inputField}
                >
                  <option value={Category.GAME}>Jogo Base (GAME)</option>
                  <option value={Category.DLC}>Expansão / DLC</option>
                  <option value={Category.SPECIAL_EDITION}>
                    Edição Especial
                  </option>
                </select>
              </div>

              {category !== Category.GAME && (
                <div className={styles.inputGroup}>
                  <label htmlFor="base-product" className={styles.inputLabel}>
                    Jogo base *
                  </label>
                  <select
                    id="base-product"
                    required
                    value={baseProductId}
                    onChange={(e) => setBaseProductId(e.target.value)}
                    className={styles.inputField}
                  >
                    <option value="">Selecione o jogo base</option>
                    {options.baseGames
                      .filter((g) => g.id !== initialProduct?.id)
                      .map((base) => (
                        <option key={base.id} value={base.id}>
                          {base.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="game-desc" className={styles.inputLabel}>
                Descrição *
              </label>
              <textarea
                id="game-desc"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sinopse e principais detalhes do jogo..."
                className={`${styles.inputField} ${styles.textareaField}`}
              />
              {fieldErrors.description && (
                <span className={styles.fieldError}>
                  {fieldErrors.description}
                </span>
              )}
            </div>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="game-dev" className={styles.inputLabel}>
                  Desenvolvedora
                </label>
                <input
                  id="game-dev"
                  type="text"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  placeholder="Ex: FromSoftware"
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="game-pub" className={styles.inputLabel}>
                  Publicadora
                </label>
                <input
                  id="game-pub"
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="Ex: Bandai Namco"
                  className={styles.inputField}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>Gêneros</span>
              <div className={styles.genreChips}>
                {options.genres.map((genre) => {
                  const selected = genreIds.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      className={`${styles.genreChip} ${
                        selected ? styles.genreChipSelected : ""
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
                {options.genres.length === 0 && (
                  <span className={styles.compatNote}>
                    Nenhum gênero cadastrado no banco.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Preço e publicação */}
          <div className={styles.formCard}>
            <h3 className={styles.cardTitleH3}>Preço e publicação</h3>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="platform" className={styles.inputLabel}>
                  Plataforma *
                </label>
                <select
                  id="platform"
                  value={platformId}
                  onChange={(e) => setPlatformId(e.target.value)}
                  disabled={mode === "edit" && Boolean(initialVariant)}
                  className={styles.inputField}
                >
                  {options.platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="sale-price" className={styles.inputLabel}>
                  Preço de venda (R$) *
                </label>
                <input
                  id="sale-price"
                  type="text"
                  required
                  value={priceText}
                  onChange={(e) => setPriceText(e.target.value)}
                  placeholder="149,90"
                  className={styles.inputField}
                />
                {fieldErrors["variants.0.price"] && (
                  <span className={styles.fieldError}>
                    {fieldErrors["variants.0.price"]}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label htmlFor="release-date" className={styles.inputLabel}>
                  Data de lançamento *
                </label>
                <input
                  id="release-date"
                  type="date"
                  required
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="product-status" className={styles.inputLabel}>
                  Status no catálogo
                </label>
                <select
                  id="product-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className={styles.inputField}
                >
                  <option value={ProductStatus.PUBLISHED}>
                    Publicado (visível na loja)
                  </option>
                  <option value={ProductStatus.DISABLED}>
                    Rascunho / Desativado
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Upload de Imagens (Capa / Banner e Galeria) */}
          <div className={styles.formCard}>
            <h3 className={styles.cardTitleH3}>
              Imagens do produto (Banner / Capa e Galeria)
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => void uploadFiles(e.target.files)}
            />

            <div
              className={styles.dropzone}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void uploadFiles(e.dataTransfer.files);
              }}
            >
              <ImagePlus size={36} className={styles.dropzoneIcon} />
              <span className={styles.dropzoneTitle}>
                {isUploading
                  ? "Enviando imagem..."
                  : "Arraste suas imagens aqui"}
              </span>
              <span className={styles.dropzoneNote}>
                JPG, PNG ou WebP · Até 5 MB por arquivo
              </span>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className={styles.selectFilesBtn}
              >
                Selecionar arquivos
              </button>
            </div>

            <div className={styles.urlImportRow}>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Ou cole uma URL https:// ou caminho /uploads/..."
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className={styles.secondarySmallBtn}
              >
                Adicionar URL
              </button>
            </div>

            {images.length > 0 && (
              <div className={styles.uploadedFileList}>
                {images.map((item) => {
                  const isCover =
                    (coverPath ?? images[0]?.path) === item.path;
                  return (
                    <div key={item.path} className={styles.uploadedFileItem}>
                      <div className={styles.uploadedFileLeft}>
                        <Image
                          src={item.path}
                          alt={item.label}
                          width={44}
                          height={32}
                          unoptimized
                          className={styles.uploadedFileThumb}
                        />
                        <div className={styles.uploadedFileInfo}>
                          <span className={styles.uploadedFileName}>
                            {item.label}
                          </span>
                          <span className={styles.uploadedFileMeta}>
                            {item.path}
                          </span>
                        </div>
                      </div>

                      <div className={styles.imageActionGroup}>
                        {isCover ? (
                          <span className={styles.coverBadgeTag}>
                            CAPA PRINCIPAL
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setCoverPath(item.path)}
                            className={styles.secondarySmallBtn}
                            title="Definir como capa principal"
                          >
                            <Star size={12} /> Definir capa
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.path)}
                          className={styles.deleteFileBtn}
                          aria-label={`Remover ${item.label}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Alocação de Chaves em Lote */}
          <div className={styles.formCard}>
            <div className={styles.cardHeaderWithBadge}>
              <h3 className={styles.cardTitleH3}>
                Alocação de chaves em lote no estoque
              </h3>
              <KeyRound size={18} className={styles.metricIcon} />
            </div>

            {mode === "edit" && (
              <div className={styles.keyStatsRow}>
                <span className={styles.keyStatPill}>
                  Disponíveis: <strong>{keyStats.available}</strong>
                </span>
                <span className={styles.keyStatPill}>
                  Reservadas: <strong>{keyStats.reserved}</strong>
                </span>
                <span className={styles.keyStatPill}>
                  Vendidas: <strong>{keyStats.sold}</strong>
                </span>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="batch-keys" className={styles.inputLabel}>
                Chaves digitais (uma por linha ou separadas por vírgula)
              </label>
              <textarea
                id="batch-keys"
                rows={4}
                value={rawKeys}
                onChange={(e) => setRawKeys(e.target.value)}
                placeholder={"AAAAA-BBBBB-CCCCC\nDDDDD-EEEEE-FFFFF"}
                className={`${styles.inputField} ${styles.textareaField}`}
              />
            </div>

            <div className={styles.keysSummaryRow}>
              <span>
                {parsedBatch.uniqueKeys.length} chave(s) única(s) pronta(s)
                {parsedBatch.internalDuplicates.length > 0 &&
                  ` · ${parsedBatch.internalDuplicates.length} repetida(s) no texto`}
              </span>

              {mode === "edit" && initialVariant && (
                <button
                  type="button"
                  disabled={
                    isPending || parsedBatch.uniqueKeys.length === 0
                  }
                  onClick={handleAllocateKeysNow}
                  className={styles.draftActionBtn}
                >
                  <Upload size={15} />
                  <span>Alocar chaves no estoque</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de Ações */}
          <div className={styles.formActionBar}>
            <Link href="/admin/games" className={styles.cancelActionBtn}>
              Voltar ao catálogo
            </Link>

            <div className={styles.actionRightButtons}>
              <button
                type="submit"
                disabled={isPending || isUploading || options.platforms.length === 0}
                className={styles.publishActionBtn}
              >
                {mode === "create" ? <Plus size={16} /> : <Save size={16} />}
                <span>
                  {isPending
                    ? "Salvando..."
                    : mode === "create"
                      ? "Cadastrar jogo"
                      : "Salvar alterações"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Prévia do Card */}
        <div className={styles.previewColumn}>
          <div className={styles.previewWrapperCard}>
            <h3 className={styles.previewHeaderTitle}>Prévia do card</h3>
            <span className={styles.previewHeaderNote}>
              Assim o jogo aparecerá no catálogo
            </span>

            <div className={styles.livePreviewCard}>
              <div className={styles.livePreviewBanner}>
                <Image
                  src={previewCover}
                  alt={title || "Prévia do jogo"}
                  fill
                  unoptimized
                  className={styles.livePreviewImg}
                />
                <span className={styles.livePreviewTagNeon}>
                  {(title || "NOVO JOGO").toUpperCase()}
                </span>
                <span className={styles.livePreviewPlatform}>
                  {selectedPlatformName.toUpperCase()}
                </span>
              </div>

              <div className={styles.livePreviewBody}>
                <span className={styles.livePreviewCategory}>
                  {selectedGenreNames}
                </span>
                <h4 className={styles.livePreviewTitle}>
                  {title || "Título do jogo"}
                </h4>
                <span className={styles.livePreviewSub}>
                  {developer || "KeyStation"} · Chave digital
                </span>

                <div className={styles.livePreviewPriceRow}>
                  <span className={styles.livePreviewPrice}>
                    {formatPricePreview(priceText)}
                  </span>
                  <div className={styles.livePreviewCartBtn}>
                    <ShoppingCart size={16} />
                  </div>
                </div>
              </div>
            </div>

            <span className={styles.notPublishedBadge}>
              {isPublished ? "PUBLICADO" : "NÃO PUBLICADO"}
            </span>
          </div>

          <div className={styles.checklistCard}>
            <Info size={22} className={styles.checklistIcon} />
            <div className={styles.checklistBody}>
              <h4 className={styles.checklistTitle}>Checklist de publicação</h4>
              <p className={styles.checklistText}>
                Defina uma capa nítida, informe o preço e aloque as chaves no
                estoque para que o produto apareça como disponível aos clientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
