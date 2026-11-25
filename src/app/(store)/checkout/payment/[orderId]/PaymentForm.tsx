"use client";

import { startTransition, useActionState, useState, type SubmitEvent } from "react";
import { CreditCard, FileText, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import {
  formatCardExpiry,
  formatCardNumber,
  formatCpf,
  formatCvv,
} from "@/utils/formatter/payment-fields";
import { FormField } from "@/components/ui/FormField/FormField";
import {
  cancelOrderAction,
  payOrderAction,
  type PaymentFormState,
} from "../../actions";
import styles from "../../checkout.module.css";

type Method = "pix" | "card" | "boleto";

const initialState: PaymentFormState = {};

const METHODS: { value: Method; title: string; hint: string; icon: typeof QrCode }[] = [
  { value: "pix", title: "Pix (Instantâneo)", hint: "Aprovação imediata e liberação instantânea no cofre", icon: QrCode },
  { value: "card", title: "Cartão de Crédito", hint: "Pague com segurança", icon: CreditCard },
  { value: "boleto", title: "Boleto Bancário", hint: "Compensação em até 1 dia útil", icon: FileText },
];

const FAKE_PIX = "00020126580014br.gov.bcb.pix0136keystation-simulado5204000053039865802BR";
const FAKE_BOLETO = "34191.79001 01043.510047 91020.150008 1 99990000027989";

export default function PaymentForm({
  orderId,
  idempotencyKey,
  defaultCpf,
  totalLabel,
}: {
  orderId: string;
  idempotencyKey: string;
  defaultCpf: string;
  totalLabel: string;
}) {
  const [method, setMethod] = useState<Method>("pix");
  const [cpf, setCpf] = useState(formatCpf(defaultCpf));
  const [holderName, setHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [state, formAction, pending] = useActionState(
    payOrderAction.bind(null, orderId),
    initialState,
  );
  const errors = state.fieldErrors ?? {};

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

        <div className={styles.cardSection}>
          <h2>Selecione o Método de Pagamento</h2>
          <div className={styles.paymentMethods}>
            {METHODS.map(({ value, title, hint, icon: Icon }) => (
              <label key={value} className={styles.paymentOption}>
                <input
                  type="radio"
                  name="method"
                  value={value}
                  checked={method === value}
                  onChange={() => setMethod(value)}
                />
                <div className={styles.optionContent}>
                  <Icon size={24} className={styles.optionIcon} />
                  <div>
                    <strong>{title}</strong>
                    <span>{hint}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.cardSection}>
          <h2>Dados do Pagamento</h2>

          <FormField label="CPF">
            <input
              name="cpf"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={14}
              value={cpf}
              onChange={(event) => setCpf(formatCpf(event.target.value))}
            />
          </FormField>
          {errors.cpf && <p role="alert" className={styles.error}>{errors.cpf}</p>}

          {method === "card" && (
            <>
              <FormField label="Nome impresso no cartão">
                <input
                  name="holderName"
                  autoComplete="cc-name"
                  value={holderName}
                  onChange={(event) => setHolderName(event.target.value)}
                />
              </FormField>
              {errors.holderName && <p role="alert" className={styles.error}>{errors.holderName}</p>}

              <FormField label="Número do cartão">
                <input
                  name="cardNumber"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  maxLength={23}
                  value={cardNumber}
                  onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                />
              </FormField>
              {errors.cardNumber && <p role="alert" className={styles.error}>{errors.cardNumber}</p>}

              <div className={styles.fieldRow}>
                <FormField label="Validade (MM/AA)">
                  <input
                    name="expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="12/30"
                    maxLength={5}
                    value={expiry}
                    onChange={(event) => setExpiry(formatCardExpiry(event.target.value))}
                  />
                </FormField>
                <FormField label="CVV">
                  <input
                    name="cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    value={cvv}
                    onChange={(event) => setCvv(formatCvv(event.target.value))}
                  />
                </FormField>
              </div>
              {errors.expiry && <p role="alert" className={styles.error}>{errors.expiry}</p>}
              {errors.cvv && <p role="alert" className={styles.error}>{errors.cvv}</p>}
            </>
          )}

          {method === "pix" && (
            <div className={styles.pixBox}>
              <div className={styles.qrPlaceholder}>
                <QrCode size={120} color="var(--primary)" />
              </div>
              <div className={styles.pixInstructions}>
                <p>Simulação: este QR Code é falso. Use o botão abaixo para aprovar o pagamento.</p>
                <div className={styles.pixKeyRow}>
                  <input type="text" readOnly value={FAKE_PIX} aria-label="Chave Pix simulada" />
                </div>
              </div>
            </div>
          )}

          {method === "boleto" && (
            <div className={styles.pixBox}>
              <div className={styles.pixInstructions}>
                <p>Simulação: esta linha digitável é falsa. Use o botão abaixo para aprovar o pagamento.</p>
                <div className={styles.pixKeyRow}>
                  <input type="text" readOnly value={FAKE_BOLETO} aria-label="Linha digitável simulada" />
                </div>
              </div>
            </div>
          )}

          {errors.method && <p role="alert" className={styles.error}>{errors.method}</p>}
          {state.error && <p role="alert" className={styles.error}>{state.error}</p>}

          <Button type="submit" variant="success" disabled={pending}>
            {pending
              ? "Processando..."
              : method === "card"
                ? `Pagar ${totalLabel}`
                : "Simular pagamento"}
          </Button>
        </div>
      </form>

      <form action={cancelOrderAction.bind(null, orderId)}>
        <Button type="submit" variant="secondary" disabled={pending}>
          Cancelar pedido
        </Button>
      </form>
    </>
  );
}
