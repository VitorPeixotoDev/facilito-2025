"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface ProfileUpdateData {
    full_name?: string;
    email?: string;
    description?: string | null;
    birth_date?: string | null;
    skills?: string[];
    courses?: string[];
    freelancer_services?: string[];
    experience?: string | null;
    academic_background?: string | null;
    has_children?: boolean | null;
    has_drivers_license?: string[];
    home_address?: {
        latitude: number;
        longitude: number;
        description: string;
    } | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    whatsapp?: string | null;
    contact_email?: string | null;
    portfolio?: string | null;
    profile_completed?: boolean;
}

/**
 * Valida os valores de has_drivers_license
 * @param licenses - Array de tipos de CNH
 * @returns true se válido, false caso contrário
 */
function validateDriversLicense(licenses: string[] | undefined | null): boolean {
    if (!licenses || licenses.length === 0) return true;

    const validLicenses = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];
    return licenses.every(license => validLicenses.includes(license));
}

/**
 * Atualiza o perfil do usuário no banco de dados
 * Usa upsert automaticamente se o registro não existir
 * @param userId - ID do usuário
 * @param data - Dados do perfil para atualizar
 * @param useUpsert - Se true, força o uso de upsert em vez de update
 * @returns Resultado da operação
 */
export async function updateProfile(userId: string, data: ProfileUpdateData, useUpsert = false) {
    const supabase = await createClient();

    // Verifica se o usuário está autenticado
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
        throw new Error("Não autorizado");
    }

    // Valida has_drivers_license antes de enviar
    if (data.has_drivers_license && !validateDriversLicense(data.has_drivers_license)) {
        throw new Error("Valor inválido para CNH. Tipos permitidos: A, B, C, D, E, AB, AC, AD, AE");
    }

    // Prepara os dados para atualização
    const updateData: Record<string, unknown> = {
        ...data,
        updated_at: new Date().toISOString(),
    };

    // Remove campos undefined
    Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
            delete updateData[key];
        }
    });

    let error;

    // Se useUpsert for true, ou se não há registro existente, usa upsert
    if (useUpsert) {
        const upsertData = {
            id: userId,
            ...updateData,
        };

        const result = await supabase.from("users").upsert(upsertData, {
            onConflict: "id",
        });
        error = result.error;
    } else {
        // Tenta update primeiro
        const result = await supabase
            .from("users")
            .update(updateData)
            .eq("id", userId);
        error = result.error;

        // Se o erro for porque o registro não existe, tenta upsert
        if (error && error.code === 'PGRST116') {
            const upsertData = {
                id: userId,
                ...updateData,
            };

            const upsertResult = await supabase.from("users").upsert(upsertData, {
                onConflict: "id",
            });
            error = upsertResult.error;
        }
    }

    if (error) {
        console.error("Erro ao atualizar perfil:", error);

        // Mensagens de erro mais específicas
        if (error.message.includes('has_drivers_license')) {
            throw new Error("Valor inválido para CNH. Tipos permitidos: A, B, C, D, E, AB, AC, AD, AE");
        }
        if (error.message.includes('home_address')) {
            throw new Error("Endereço inválido. Verifique os dados de localização.");
        }
        if (error.message.includes('constraint') || error.message.includes('violates')) {
            throw new Error(`Dados inválidos: ${error.message}`);
        }

        throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }

    revalidatePath("/applicant/profile");
    return { success: true };
}

/**
 * Cria ou atualiza o perfil do usuário (upsert)
 * @param userId - ID do usuário
 * @param data - Dados do perfil
 * @returns Resultado da operação
 */
export async function upsertProfile(userId: string, data: ProfileUpdateData) {
    const supabase = await createClient();

    // Verifica se o usuário está autenticado
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
        throw new Error("Não autorizado");
    }

    const upsertData = {
        id: userId,
        ...data,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("users").upsert(upsertData, {
        onConflict: "id",
    });

    if (error) {
        console.error("Erro ao salvar perfil:", error);
        throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }

    revalidatePath("/applicant/profile");
    return { success: true };
}

