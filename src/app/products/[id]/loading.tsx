import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import styles from "./product.module.css";

/**  Copia a estrutura do layout de page.tsx e aplica um skeleton nas partes que possuem dados. */
export default function Loading() {
  return (
    <PageContainer gap="none">
      <div className={styles.mainGrid} role="status" aria-busy="true" aria-label="Carregando produto">
        <div className={styles.leftCol}>
          <Skeleton height={420} radius={16} />

          <div className={styles.section}>
            <Skeleton width="40%" height="1.5rem" />
            <Skeleton />
            <Skeleton />
            <Skeleton width="70%" />
          </div>

          <div className={styles.section}>
            <Skeleton width="55%" height="1.5rem" />
            <div className={styles.requirementsBox}>
              <Skeleton height="2.5rem" />
              <Skeleton height="2.5rem" />
              <Skeleton height="2.5rem" />
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.buyBox}>
            <Skeleton width="55%" height="1rem" />
            <Skeleton height="2rem" />
            <Skeleton width="65%" height="2rem" />

            <div className={styles.devInfo}>
              <Skeleton width="70%" height="0.9rem" />
              <Skeleton width="60%" height="0.9rem" />
            </div>

            <div className={styles.pricingSection}>
              <Skeleton width="45%" height="2.75rem" />
              <Skeleton width={72} height="1.75rem" />
            </div>

            <div className={styles.featuresList}>
              <Skeleton width="80%" height="1rem" />
              <Skeleton width="65%" height="1rem" />
            </div>

            <Skeleton height="3.25rem" radius={10} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}