"use client";

import { useActionState } from "react";
import { Tag, X } from "lucide-react";
import {
  applyCouponAction,
  removeCouponAction,
  type CouponFormState,
} from "./actions";
import styles from "./cart.module.css";

const initialState: CouponFormState = {};

const errorStyle = { color: "#f87171", fontSize: "0.85rem", marginTop: "6px" };

export default function CouponForm({
  appliedCode,
}: {
  appliedCode: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    applyCouponAction,
    initialState,
  );

  if (appliedCode) {
    return (
      <form action={removeCouponAction} className={styles.couponSection}>
        <div className={styles.couponInputWrapper}>
          <Tag size={16} />
          <span>Cupom {appliedCode} aplicado</span>
        </div>
        <button
          type="submit"
          className={styles.couponBtn}
          aria-label="Remover cupom"
        >
          <X size={16} />
        </button>
      </form>
    );
  }

  return (
    <form action={formAction}>
      <div className={styles.couponSection}>
        <div className={styles.couponInputWrapper}>
          <Tag size={16} />
          <input
            type="text"
            name="code"
            placeholder="Cupom de desconto"
            autoComplete="off"
          />
        </div>
        <button type="submit" className={styles.couponBtn} disabled={pending}>
          {pending ? "Aplicando..." : "Aplicar"}
        </button>
      </div>
      {state.error && (
        <p role="alert" style={errorStyle}>
          {state.error}
        </p>
      )}
    </form>
  );
}