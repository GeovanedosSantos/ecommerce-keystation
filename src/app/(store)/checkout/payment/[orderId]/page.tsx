import { Suspense } from "react";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { PageContainer } from "@/components/ui/PageContainer/PageContainer";
import { SectionHeader } from "@/components/ui/SectionHeader/SectionHeader";
import { getOrderForPayment } from "@/core/modules/order/order.service";
import { orderIdSchema } from "@/core/modules/order/schema";
import { getSession } from "@/infra/session-cookie";
import { formatBRL } from "../../format";
import styles from "../../checkout.module.css";
import PaymentForm from "./PaymentForm";

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function Notice({ message }: { message: string }) {
  return (
    <div className={styles.cardSection}>
      <p>{message}</p>
      <Button href="/cart" inline>
        Voltar ao carrinho
      </Button>
    </div>
  );
}

async function PaymentContent({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Uma chave nova por renderização: reenviar o mesmo form reaproveita a chave.
  await connection();
  const idempotencyKey = randomUUID();

  const parsed = orderIdSchema.safeParse((await params).orderId);
  const order = parsed.success ? await getOrderForPayment(session.userId, parsed.data) : null;

  if (!order) return <Notice message="Pedido não encontrado." />;
  if (order.status === "PAID") redirect(`/checkout/success?order=${order.id}`);
  if (order.status !== "PENDING" || order.isExpired) {
    return <Notice message="Este pedido não está mais aguardando pagamento. Refaça a compra pelo carrinho." />;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.mainContent}>
        <PaymentForm
          orderId={order.id}
          idempotencyKey={idempotencyKey}
          defaultCpf={order.userCpf ?? ""}
          totalLabel={formatBRL(order.totalCents)}
        />
      </div>

      <div className={styles.sidebar}>
        <div className={styles.cardSection}>
          <h2>Pedido {order.number}</h2>
          <div className={styles.summaryDetails}>
            {order.items.map((item) => (
              <div key={item.id} className={styles.summaryRow}>
                <span>{item.title}</span>
                <span>{formatBRL(item.paidPriceCents)}</span>
              </div>
            ))}
            {order.discountCents > 0 && (
              <div className={styles.summaryRow}>
                <span>Desconto{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className={styles.free}>- {formatBRL(order.discountCents)}</span>
              </div>
            )}
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total a Pagar</span>
            <span>{formatBRL(order.totalCents)}</span>
          </div>
          <div className={styles.securityNote}>
            <Clock size={18} className={styles.successIcon} />
            <span>Reserva válida até {timeFormat.format(order.expiresAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
  return (
    <PageContainer>
      <SectionHeader level="page" title="Pagamento" />
      <Suspense fallback={<p>Carregando pedido...</p>}>
        <PaymentContent params={params} />
      </Suspense>
    </PageContainer>
  );
}
