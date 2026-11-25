"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    cancelOrder,
    createOrderFromCart,
    findLatestPendingOrderId,
    payOrder,
    type CreateOrderError,
    type PayOrderError,
} from "@/core/modules/order/order.service";
import {
    idempotencyKeySchema,
    orderIdSchema,
    paymentInputSchema,
} from "@/core/modules/order/schema";
import { getSession } from "@/infra/session-cookie";

export type CheckoutFormState = { error?: string };

export type PaymentFormState = {
    error?: string;
    /** Mensagem por campo, indexada pelo nome do input. */
    fieldErrors?: Record<string, string>;
};

const CREATE_ORDER_MESSAGES: Record<CreateOrderError, string> = {
    EMPTY_CART: "Seu carrinho está vazio.",
    COUPON_INVALID: "O cupom do carrinho deixou de valer e foi removido. Confira o total e confirme de novo.",
    OUT_OF_STOCK: "Alguns jogos esgotaram.",
};

const PAY_ORDER_MESSAGES: Record<PayOrderError, string> = {
    NOT_FOUND: "Pedido não encontrado.",
    NOT_PENDING: "Este pedido não está mais aguardando pagamento.",
    EXPIRED: "A reserva deste pedido expirou. Volte ao carrinho e refaça a compra.",
    CPF_MISMATCH: "O CPF informado é diferente do CPF cadastrado na sua conta.",
    CPF_IN_USE: "Este CPF já está cadastrado em outra conta.",
    IDEMPOTENCY_KEY_REUSED: "Pagamento inválido. Recarregue a página e tente de novo.",
};

async function requireUserId(): Promise<string> {
    const session = await getSession();
    if (!session) redirect("/login");
    return session.userId;
}

function refreshCartViews(): void {
    revalidatePath("/cart");
    revalidatePath("/", "layout");
}

export async function createOrderAction(): Promise<CheckoutFormState> {
    const userId = await requireUserId();

    const result = await createOrderFromCart(userId);
    if (!result.ok) {
        if (result.error === "EMPTY_CART") {
            // Segundo clique: o primeiro já criou o pedido, então segue para o pagamento dele.
            const pendingId = await findLatestPendingOrderId(userId);
            redirect(pendingId ? `/checkout/payment/${pendingId}` : "/cart");
        }

        const titles = result.outOfStockTitles?.join(", ");
        const message = CREATE_ORDER_MESSAGES[result.error];
        return { error: titles ? `${message} (${titles}). Remova do carrinho para continuar.` : message };
    }

    refreshCartViews();
    redirect(`/checkout/payment/${result.orderId}`);
}

export async function payOrderAction(
    orderId: string,
    _prevState: PaymentFormState,
    formData: FormData,
): Promise<PaymentFormState> {
    const userId = await requireUserId();

    const orderIdResult = orderIdSchema.safeParse(orderId);
    if (!orderIdResult.success) return { error: PAY_ORDER_MESSAGES.NOT_FOUND };

    const keyResult = idempotencyKeySchema.safeParse(formData.get("idempotencyKey"));
    if (!keyResult.success) return { error: PAY_ORDER_MESSAGES.IDEMPOTENCY_KEY_REUSED };

    const parsed = paymentInputSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
            const field = String(issue.path[0] ?? "method");
            fieldErrors[field] ??= issue.message;
        }
        return { fieldErrors };
    }

    const result = await payOrder(userId, orderIdResult.data, keyResult.data, parsed.data);
    if (!result.ok) return { error: PAY_ORDER_MESSAGES[result.error] };

    // Também no alreadyPaid: um reenvio cai na mesma página de sucesso.
    redirect(`/checkout/success?order=${result.orderId}`);
}

export async function cancelOrderAction(orderId: string): Promise<void> {
    const userId = await requireUserId();

    const parsed = orderIdSchema.safeParse(orderId);
    if (parsed.success) await cancelOrder(userId, parsed.data);

    refreshCartViews();
    redirect("/cart");
}
