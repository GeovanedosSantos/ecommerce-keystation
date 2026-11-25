export function isValidCardNumber(value: string): boolean {
    const digits = value.replace(/[\s-]/g, "");
    if (!/^\d{13,19}$/.test(digits)) return false;

    let sum = 0;
    let double = false;
    for (let index = digits.length - 1; index >= 0; index--) {
        let digit = Number(digits[index]);
        if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        double = !double;
    }
    return sum % 10 === 0;
}

/** `year` com 2 dígitos (AA) vale como 20AA. O cartão vale até o fim do mês de validade. */
export function isCardExpired(month: number, year: number, now: Date = new Date()): boolean {
    const fullYear = year < 100 ? 2000 + year : year;
    return new Date(fullYear, month, 1) <= now;
}
