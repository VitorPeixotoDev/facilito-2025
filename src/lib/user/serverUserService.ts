/**
 * Server-side user service
 * Funções para buscar dados do usuário no servidor
 */

import { createClient } from '@/utils/supabase/server'
import type { UserProfile } from '@/components/AuthClientProvider'

/**
 * Busca o perfil completo do usuário no servidor
 */
export async function fetchUserProfileServer(userId: string): Promise<UserProfile | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            // Se o perfil não existe, retorna null
            if (error.code === 'PGRST116') {
                return null
            }
            console.warn('Erro ao buscar perfil:', error)
            return null
        }

        return data as UserProfile
    } catch (error) {
        console.warn('Erro ao buscar perfil (não crítico):', error)
        return null
    }
}

/**
 * Cria um perfil básico para o usuário se não existir
 */
export async function createBasicProfile(
    userId: string,
    email?: string | null,
    fullName?: string | null
): Promise<UserProfile | null> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: email || null,
                full_name: fullName || null,
            } as any)
            .select()
            .single()

        if (error) {
            console.warn('Erro ao criar perfil:', error)
            return null
        }

        return data as UserProfile
    } catch (error) {
        console.warn('Erro ao criar perfil:', error)
        return null
    }
}

/**
 * Busca ou cria o perfil do usuário
 */
export async function getOrCreateUserProfile(
    userId: string,
    email?: string | null,
    fullName?: string | null
): Promise<UserProfile | null> {
    let profile = await fetchUserProfileServer(userId)

    // Se não existe, cria um básico
    if (!profile) {
        profile = await createBasicProfile(userId, email, fullName)
    }

    return profile
}

