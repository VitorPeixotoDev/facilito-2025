/**
 * Serviço para gerenciar competências autorizadas pelo usuário
 */

import { createClient } from '@/utils/supabase/client';

/**
 * Salva competências autorizadas pelo usuário no perfil
 */
export async function saveAuthorizedCompetencies(
    userId: string,
    competencies: string[]
): Promise<boolean> {
    try {
        const supabase = createClient();

        const updateData = {
            authorized_competencies: competencies,
            updated_at: new Date().toISOString(),
        };

        const { error } = await (supabase.from('users') as any)
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Erro ao salvar competências autorizadas:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao salvar competências autorizadas:', error);
        return false;
    }
}

/**
 * Limpa todas as competências autorizadas do usuário
 * Usado quando o usuário inicia um novo teste para permitir novas seleções
 */
export async function clearAuthorizedCompetencies(userId: string): Promise<boolean> {
    try {
        const supabase = createClient();

        const updateData: Record<string, any> = {
            authorized_competencies: [],
            updated_at: new Date().toISOString(),
        };

        const query = supabase.from('users') as any;
        const { error } = await query.update(updateData).eq('id', userId);

        if (error) {
            console.error('Erro ao limpar competências autorizadas:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao limpar competências autorizadas:', error);
        return false;
    }
}

/**
 * Busca as competências autorizadas do usuário
 */
export async function getAuthorizedCompetencies(userId: string): Promise<string[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('users')
            .select('authorized_competencies')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Erro ao buscar competências autorizadas:', error);
            return [];
        }

        return ((data as any)?.authorized_competencies || []) as string[];
    } catch (error) {
        console.error('Erro ao buscar competências autorizadas:', error);
        return [];
    }
}

/**
 * Adiciona competências autorizadas ao perfil existente (sem substituir)
 */
export async function addAuthorizedCompetencies(
    userId: string,
    newCompetencies: string[]
): Promise<boolean> {
    try {
        const supabase = createClient();

        // Buscar competências atuais
        const { data: currentProfile, error: fetchError } = await supabase
            .from('users')
            .select('authorized_competencies')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('Erro ao buscar perfil:', fetchError);
            return false;
        }

        const currentCompetencies = ((currentProfile as any)?.authorized_competencies || []) as string[];
        const mergedCompetencies = Array.from(new Set([...currentCompetencies, ...newCompetencies]));

        const updateData = {
            authorized_competencies: mergedCompetencies,
            updated_at: new Date().toISOString(),
        };

        const { error } = await (supabase.from('users') as any)
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Erro ao adicionar competências autorizadas:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erro ao adicionar competências autorizadas:', error);
        return false;
    }
}

