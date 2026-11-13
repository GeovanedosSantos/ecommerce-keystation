"use client";

import { useState, useTransition } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { addToCartAction } from "@/app/cart/actions";

type Status = "idle" | "added" | "error";

export function AddToCartButton({
  productId,
  title,
}: {
  productId: string;
  title: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await addToCartAction(productId);
      setStatus(result.ok ? "added" : "error");
      setTimeout(() => setStatus("idle"), 2000);
    });
  }

  const variant =
    status === "added" ? "success" : status === "error" ? "danger" : "primary";

  const label =
    status === "added"
      ? `${title} adicionado ao carrinho`
      : status === "error"
        ? `Não foi possível adicionar ${title}`
        : `Adicionar ${title} ao carrinho`;

  return (
    <Button
      size="icon"
      variant={variant}
      aria-label={label}
      onClick={handleClick}
      disabled={pending}
    >
      {status === "added" ? <Check size={18} /> : <ShoppingCart size={18} />}
    </Button>
  );
}