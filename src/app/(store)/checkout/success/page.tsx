import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { getOrder } from "@/core/modules/order/order.service";
import { orderIdSchema } from "@/core/modules/order/schema";
import { getSession } from "@/infra/session-cookie";
import styles from "./success.module.css";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function SuccessContent({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { order: orderParam } = await searchParams;
  const parsed = orderIdSchema.safeParse(orderParam);
  const order = parsed.success ? await getOrder(session.userId, parsed.data) : null;
  if (!order || order.status !== "PAID") redirect("/cart");

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <CheckCircle2 size={64} className={styles.successIcon} />
      </div>

      <h1>Pagamento Aprovado!</h1>
      <p className={styles.subtitle}>
        Seu pedido <strong>{order.number}</strong> foi processado com sucesso e suas chaves digitais já estão disponíveis no seu cofre.
      </p>

      <div className={styles.actions}>
        <Button href="/account/vault">
          <KeyRound size={18} /> Ir para o Meu Cofre (Minhas Chaves)
        </Button>
        <Link href="/catalog" className={styles.catalogBtn}>
          Continuar Comprando <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <PageContainer width="md" paddingY="2xl" gap="none">
      <Suspense fallback={<p>Carregando pedido...</p>}>
        <SuccessContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
