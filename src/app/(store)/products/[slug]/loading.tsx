import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import galleryStyles from "./ProductGallery/ProductGallery.module.css";
import requirementsStyles from "./SystemRequirements/SystemRequirements.module.css";
import styles from "./product.module.css";

/** Copia a estrutura do layout de page.tsx e aplica um skeleton nas partes que possuem dados. */
export default function Loading() {
  return (
    <PageContainer width="xxl" gap="md">
      <div role="status" aria-busy="true" aria-label="Carregando produto">
        <Skeleton width="30%" height="0.75rem" />
      </div>

      <div className={styles.overview} aria-hidden="true">
        <div className={galleryStyles.gallery}>
          <div className={galleryStyles.stage}>
            <Skeleton height="100%" radius={16} />
          </div>
          <div className={galleryStyles.thumbnails}>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={galleryStyles.thumbnail}>
                <Skeleton height="100%" radius={0} />
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <Skeleton width="80%" height="2.5rem" />
            <hr className={styles.divider} />
            <Skeleton width="50%" height="3.5rem" />
            <Skeleton height="3.25rem" radius={10} />
            <Skeleton width="60%" height="0.75rem" />
            <hr className={styles.divider} />
            <div className={styles.meta}>
              <Skeleton width="45%" height="0.9rem" />
              <Skeleton width="30%" height="0.9rem" />
              <Skeleton height="0.9rem" />
              <Skeleton height="0.9rem" />
              <Skeleton height="0.9rem" />
            </div>
          </div>

          <div className={styles.panel}>
            <Skeleton width="30%" height="1.5rem" />
            <Skeleton width="55%" height="1.5rem" />
          </div>
        </div>

        <div className={styles.about}>
          <Skeleton width="25%" height="2rem" />
          <Skeleton />
          <Skeleton />
          <Skeleton width="70%" />
        </div>
      </div>

      <div className={requirementsStyles.requirements} aria-hidden="true">
        <Skeleton width="35%" height="1.75rem" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} height="1.5rem" />
        ))}
      </div>
    </PageContainer>
  );
}
