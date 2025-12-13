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
 * Atualiza o perfil do usuário no banco de dados
 * @param userId - ID do usuário
 * @param data - Dados do perfil para atualizar
 * @returns Resultado da operação
 */
export async function updateProfile(userId: string, data: ProfileUpdateData) {
    const supabase = await createClient();

    // Verifica se o usuário está autenticado
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
        throw new Error("Não autorizado");
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

    const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userId);

    if (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
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

