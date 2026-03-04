/**
 * Server-side ranking service
 * Versão simplificada do ranking para server-side (sem Web Workers)
 */

import { createClient } from '@/utils/supabase/server'
import { getCourseDisplayName } from '@/lib/constants/education_courses'
import type { CandidateProfile, RankingResult } from './types'

/**
 * Busca candidatos do banco de dados no servidor
 */
async function fetchCandidatesFromDatabaseServer(
    userId: string,
    limit: number = 200
): Promise<CandidateProfile[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                full_name,
                description,
                skills,
                courses,
                freelancer_services,
                experience,
                academic_background,
                home_address,
                profile_analysis,
                profile_completed,
                graduations
            `)
            .neq('id', userId)
            .limit(limit)

        if (error) {
            console.error('Error fetching candidates:', error)
            return []
        }

        return ((data || []) as any[]).map((row: any) => ({
            id: row.id,
            full_name: row.full_name,
            description: row.description,
            skills: row.skills || [],
            courses: (row.courses || []).map((c: string) => getCourseDisplayName(c)),
            freelancer_services: row.freelancer_services || [],
            experience: row.experience,
            academic_background: row.academic_background,
            home_address: row.home_address
                ? {
                    latitude: typeof (row.home_address as any).latitude === 'string'
                        ? parseFloat((row.home_address as any).latitude)
                        : (row.home_address as any).latitude,
                    longitude: typeof (row.home_address as any).longitude === 'string'
                        ? parseFloat((row.home_address as any).longitude)
                        : (row.home_address as any).longitude,
                    description: (row.home_address as any).description,
                }
                : null,
            profile_analysis: row.profile_analysis || [],
            profile_completed: row.profile_completed || false,
            graduations: row.graduations || [],
        }))
    } catch (error) {
        console.error('Error in fetchCandidatesFromDatabaseServer:', error)
        return []
    }
}

/**
 * Busca perfil do usuário no servidor
 */
async function fetchUserProfileServer(userId: string): Promise<CandidateProfile | null> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                full_name,
                description,
                skills,
                courses,
                freelancer_services,
                experience,
                academic_background,
                home_address,
                profile_analysis,
                profile_completed,
                graduations
            `)
            .eq('id', userId)
            .single()

        if (error) {
            console.error('Error fetching user profile:', error);
            return null
        }

        const profile = data as any
        return {
            id: profile.id,
            full_name: profile.full_name,
            description: profile.description,
            skills: profile.skills || [],
            courses: (profile.courses || []).map((c: string) => getCourseDisplayName(c)),
            freelancer_services: profile.freelancer_services || [],
            experience: profile.experience,
            academic_background: profile.academic_background,
            home_address: profile.home_address
                ? {
                    latitude: typeof profile.home_address.latitude === 'string'
                        ? parseFloat(profile.home_address.latitude)
                        : profile.home_address.latitude,
                    longitude: typeof profile.home_address.longitude === 'string'
                        ? parseFloat(profile.home_address.longitude)
                        : profile.home_address.longitude,
                    description: profile.home_address.description,
                }
                : null,
            profile_analysis: profile.profile_analysis || [],
            profile_completed: profile.profile_completed || false,
            graduations: profile.graduations || [],
        }
    } catch (error) {
        console.error('Error in fetchUserProfileServer:', error)
        return null
    }
}

/**
 * Calcula distância entre duas coordenadas (Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

/**
 * Versão simplificada do ranking para server-side
 * Retorna null se não conseguir calcular (fallback para client-side)
 */
export async function fetchAndRankCandidatesServer(
    userId: string,
    maxDistance: number = 20000
): Promise<(RankingResult & { userInTop20: boolean }) | null> {
    try {
        // Buscar perfil do usuário
        const user = await fetchUserProfileServer(userId)
        if (!user) {
            return null
        }

        // Buscar candidatos
        const candidates = await fetchCandidatesFromDatabaseServer(userId)

        // Por enquanto, retornar null para usar a versão client-side
        // Isso pode ser implementado depois se necessário
        // Por enquanto, vamos deixar o ranking ser feito no client-side
        // mas com os dados já carregados no servidor
        return null
    } catch (error) {
        console.error('Error in fetchAndRankCandidatesServer:', error)
        return null
    }
}

