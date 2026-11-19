import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { getVariantsAvailability } from "@/core/modules/product/service";
import { ProductGallery } from "./ProductGallery/ProductGallery";
import { OtherEditions } from "./OtherEditions/OtherEditions";
import { SystemRequirements } from "./SystemRequirements/SystemRequirements";
import { getProductContent } from "./data";
import { CATEGORY_LABEL } from "./labels";
import { variantIdsToPrice, withAvailability } from "./mapper";
import type { ProductVariantView } from "./types";
import styles from "./product.module.css";

const releaseDateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

async function loadProduct(slug: string) {
  const content = await getProductContent(slug);
  if (!content) notFound();

  // Preço e estoque dependem do momento do acesso: nada daqui em diante entra no prerender.
  await connection();

  const availability = await getVariantsAvailability(variantIdsToPrice(content));
  const product = withAvailability(content, availability);
  if (!product) notFound();

  return product;
}

function selectVariant(variants: ProductVariantView[], platform: string | string[] | undefined) {
  return variants.find((variant) => variant.platform.slug === platform) ?? variants[0];
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const product = await loadProduct(slug);

  const variant = selectVariant(product.variants, query.plataforma);
  const promo = variant.promotionalPrice;
  const discount = variant.discountPercent;
  const hasPromo = promo !== null && discount !== null && promo < variant.price;
  const finalPrice = hasPromo ? promo : variant.price;

  const requirements = variant.platform.hasSystemRequirements ? product.systemRequirements : null;
  const mainGenre = product.genres[0];

  const details = [
    { label: "Desenvolvedor", value: product.developer },
    { label: "Distribuidor", value: product.publisher },
    { label: "Lançamento", value: releaseDateFormat.format(new Date(variant.releaseDate)) },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <PageContainer width="xxl" gap="md">
      <nav aria-label="Trilha de navegação" className={styles.breadcrumb}>
        <ol>
          <li>
            <Link href="/">Início</Link>
          </li>
          {mainGenre && (
            <li>
              <Link href="/catalog">{mainGenre.name}</Link>
            </li>
          )}
          <li aria-current="page">{product.title}</li>
        </ol>
      </nav>

      <div className={styles.overview}>
        <ProductGallery
          title={product.title}
          trailerYoutubeId={product.trailerYoutubeId}
          gallery={product.gallery}
          coverPath={product.coverPath}
        />

        <div className={styles.sidebar}>
          <aside className={styles.panel} aria-label="Compra">
            <h1 className={styles.title}>{product.title}</h1>

            <hr className={styles.divider} />

            <div className={styles.pricing}>
              <Price value={finalPrice} originalValue={variant.price} size="xl" />
              {hasPromo && <span className={styles.discount}>−{discount}%</span>}
            </div>

            {variant.inStock ? (
              <Button href="/cart">
                <ShoppingCart size={20} />
                Adicionar ao Carrinho
              </Button>
            ) : (
              <Button disabled>Esgotado</Button>
            )}

            <p className={styles.note}>Pagamento com Pix, cartão ou boleto.</p>

            <hr className={styles.divider} />

            <div className={styles.meta}>
              {product.variants.length > 1 ? (
                <ul className={styles.platforms} aria-label="Plataforma">
                  {product.variants.map(({ id, platform }) => {
                    const active = platform.id === variant.platform.id;
                    return (
                      <li key={id}>
                        <Link
                          href={`?plataforma=${platform.slug}`}
                          scroll={false}
                          replace
                          aria-current={active ? "true" : undefined}
                          className={`${styles.platform} ${active ? styles.platformActive : ""}`}
                        >
                          {platform.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <p className={styles.metaTitle}>{variant.platform.name} · Chave digital</p>
              <p className={styles.metaText}>{CATEGORY_LABEL[product.category]}</p>

              {details.length > 0 && (
                <dl className={styles.details}>
                  {details.map(({ label, value }) => (
                    <div key={label} className={styles.detail}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </aside>

          {product.genres.length > 0 && (
            <section className={styles.panel} aria-labelledby="generos">
              <h2 id="generos" className={styles.panelTitle}>
                Gêneros
              </h2>
              <ul className={`${styles.tags} ${styles.tagsLg}`}>
                {product.genres.map((genre) => (
                  <li key={genre.id} className={styles.tag}>
                    {genre.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <section className={styles.about} aria-labelledby="sobre-o-jogo">
          <h2 id="sobre-o-jogo" className={styles.sectionTitle}>
            Sobre o Jogo
          </h2>
          {product.description.split("\n\n").map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </section>
      </div>

      <OtherEditions editions={product.editions} platformId={variant.platform.id} />

      {requirements && <SystemRequirements requirements={requirements} />}
    </PageContainer>
  );
}
