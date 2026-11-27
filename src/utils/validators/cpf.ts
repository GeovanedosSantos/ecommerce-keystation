export function normalizeCpf(value: string): string {
    return value.replace(/\D/g, "");
}

function checkDigit(digits: number[], length: number): number {
    const sum = digits
        .slice(0, length)
        .reduce((acc, digit, index) => acc + digit * (length + 1 - index), 0);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
}

export function isValidCpf(value: string): boolean {
    const cpf = normalizeCpf(value);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    const digits = [...cpf].map(Number);
    return checkDigit(digits, 9) === digits[9] && checkDigit(digits, 10) === digits[10];
}
