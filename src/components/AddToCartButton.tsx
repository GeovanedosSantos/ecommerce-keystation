"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { addToCartAction } from "@/app/(store)/cart/actions";

type AddToCartButtonProps = {
    variantId?: string;
    title: string;
    /** O jogo já está no carrinho: o botão vira um atalho para ele. */
    inCart?: boolean;
};

export function AddToCartButton({
    variantId,
    title,
    inCart = false,
}: AddToCartButtonProps) {
    // Marca na hora do clique; a action revalida a página e o `inCart` vindo do servidor confirma.
    const [optimisticInCart, setOptimisticInCart] = useOptimistic(inCart);
    const [failed, setFailed] = useState(false);
    const [pending, startTransition] = useTransition();

    if (optimisticInCart) {
        return (
            <Button href="/cart" size="icon" variant="success" aria-label={`${title} já está no carrinho. Ver carrinho`}>
                <Check size={18} aria-hidden="true" />
            </Button>
        );
    }

    function handleClick() {
        if (!variantId) return;
        setFailed(false);
        startTransition(async () => {
            setOptimisticInCart(true);
            const result = await addToCartAction(variantId);
            if (!result.ok) {
                setFailed(true);
                setTimeout(() => setFailed(false), 2000);
            }
        });
    }

    return (
        <Button
            size="icon"
            variant={failed ? "danger" : "primary"}
            aria-label={failed ? `Não foi possível adicionar ${title}` : `Adicionar ${title} ao carrinho`}
            onClick={handleClick}
            disabled={pending || !variantId}
        >
            <ShoppingCart size={18} aria-hidden="true" />
        </Button>
    );
}
