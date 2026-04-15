/**
 * Utilitários para componentes de perfil
 */

/** Data de hoje no fuso local, formato YYYY-MM-DD (para `input type="date"` e comparações). */
export function getTodayLocalIsoDate(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Verifica se uma data YYYY-MM-DD é estritamente posterior a hoje (fuso local). */
export function isBirthDateAfterToday(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    return dateStr > getTodayLocalIsoDate();
}

/**
 * Calcula a idade a partir de uma data de nascimento
 * 
 * @param birthDate - Data de nascimento no formato YYYY-MM-DD ou ISO string
 * @returns Idade em anos ou null se a data for inválida
 */
export function calculateAge(birthDate: string | null): number | null {
    if (!birthDate) return null;

    try {
        const birth = new Date(birthDate);
        const today = new Date();

        // Verifica se a data é válida
        if (isNaN(birth.getTime())) return null;

        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        // Ajusta se ainda não fez aniversário este ano
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    } catch {
        return null;
    }
}

/**
 * Formata uma data para exibição
 * 
 * @param dateString - Data no formato ISO ou YYYY-MM-DD
 * @returns Data formatada em pt-BR ou null
 */
export function formatDate(dateString: string | null): string | null {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        return null;
    }
}

