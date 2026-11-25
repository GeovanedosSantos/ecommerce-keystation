"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { createOrderAction, type CheckoutFormState } from "./actions";
import styles from "./checkout.module.css";

const initialState: CheckoutFormState = {};

export default function ConfirmOrderForm() {
  const [state, formAction, pending] = useActionState(createOrderAction, initialState);

  return (
    <form action={formAction} className={styles.confirmForm}>
      <Button type="submit" variant="success" disabled={pending}>
        <Lock size={16} /> {pending ? "Reservando chaves..." : "Confirmar pedido"}
      </Button>
      {state.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}
    </form>
  );
}
