const onlyDigits = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

/** 000.000.000-00, descartando tudo que não for número. */
export function formatCpf(value: string): string {
    const d = onlyDigits(value, 11);
    return d
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** Grupos de 4 dígitos separados por espaço (até 19 dígitos). */
export function formatCardNumber(value: string): string {
    return onlyDigits(value, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** MM/AA: a barra entra sozinha depois do mês. */
export function formatCardExpiry(value: string): string {
    const d = onlyDigits(value, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function formatCvv(value: string): string {
    return onlyDigits(value, 4);
}
