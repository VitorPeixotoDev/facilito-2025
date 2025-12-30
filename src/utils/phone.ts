import { z } from 'zod';

/**
 * Schema Zod para validar telefone celular brasileiro
 * Formato: DDD (2 dígitos) + 9 dígitos do celular
 * Exemplo: (11) 98765-4321
 */
export const phoneSchema = z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, {
        message: 'Telefone deve estar no formato (XX) 9XXXX-XXXX',
    })
    .refine(
        (phone) => {
            // Remove formatação para validar DDD e número
            const cleaned = phone.replace(/\D/g, '');
            const ddd = cleaned.substring(0, 2);
            const number = cleaned.substring(2);

            // Valida DDD (11-99, exceto alguns códigos reservados)
            const validDDDs = [
                '11', '12', '13', '14', '15', '16', '17', '18', '19',
                '21', '22', '24', '27', '28',
                '31', '32', '33', '34', '35', '37', '38',
                '41', '42', '43', '44', '45', '46', '47', '48', '49',
                '51', '53', '54', '55',
                '61', '62', '63', '64',
                '65', '66', '67', '68', '69',
                '71', '73', '74', '75', '77',
                '79', '81', '87',
                '82', '83', '84', '85', '86', '88', '89',
                '91', '92', '93', '94', '95', '96', '97', '98', '99'
            ];

            if (!validDDDs.includes(ddd)) return false;

            // Valida se o número começa com 9 (celular)
            if (number.length !== 9 || number[0] !== '9') return false;

            return true;
        },
        {
            message: 'Telefone deve ser um celular válido (9 dígitos começando com 9)',
        }
    );

/**
 * Aplica máscara de telefone celular brasileiro
 * Formato: (XX) 9XXXX-XXXX
 */
export function formatPhone(value: string): string {
    // Remove tudo que não é número
    const cleaned = value.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limited = cleaned.slice(0, 11);

    // Aplica a máscara
    if (limited.length <= 2) {
        return limited.length > 0 ? `(${limited}` : '';
    } else if (limited.length <= 7) {
        return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
        return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
}

/**
 * Remove formatação do telefone
 * Retorna apenas os números
 */
export function unformatPhone(value: string): string {
    return value.replace(/\D/g, '');
}

/**
 * Valida telefone usando o schema Zod
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
    try {
        phoneSchema.parse(phone);
        return { valid: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                valid: false,
                error: error.issues[0]?.message || 'Telefone inválido',
            };
        }
        return { valid: false, error: 'Telefone inválido' };
    }
}

