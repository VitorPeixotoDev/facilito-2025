/**
 * Server-side assessment service
 * Funções para buscar avaliações no servidor
 */

import { createClient } from '@/utils/supabase/server'
import { getAssessmentsFromCatalog } from './assessmentCatalogService'
import { getAssessmentById } from './assessmentsConfig'
import type { AssessmentConfig } from '@/types/assessments'

export interface UserAssessment {
    assessmentId: string
    assessmentConfig: AssessmentConfig
    hasResult: boolean
    completedAt?: Date
}

/**
 * Busca todas as avaliações realizadas por um usuário no servidor
 */
export async function getUserAssessmentsServer(userId: string): Promise<UserAssessment[]> {
    try {
        const supabase = await createClient()
        const catalog = await getAssessmentsFromCatalog(supabase)
        const idBySlug = Object.fromEntries(catalog.map((a) => [a.slug, a.id]))
        const assessments: UserAssessment[] = []

        // Verifica FiveMind
        const { data: fiveMindData, error: fiveMindError } = await supabase
            .from('five_mind_results')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (!fiveMindError && fiveMindData) {
            const id = idBySlug['five-mind']
            const config = getAssessmentById('five-mind')
            if (id && config) {
                assessments.push({
                    assessmentId: id,
                    assessmentConfig: config,
                    hasResult: true,
                    completedAt: new Date((fiveMindData as any).completed_at),
                })
            }
        }

        // Verifica HexaMind
        const { data: hexaMindData, error: hexaMindError } = await supabase
            .from('hexa_mind_results')
            .select('completed_at')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (!hexaMindError && hexaMindData) {
            const id = idBySlug['hexa-mind']
            const config = getAssessmentById('hexa-mind')
            if (id && config) {
                assessments.push({
                    assessmentId: id,
                    assessmentConfig: config,
                    hasResult: true,
                    completedAt: new Date((hexaMindData as any).completed_at),
                })
            }
        }

        // Ordena por data de conclusão (mais recente primeiro)
        return assessments.sort((a, b) => {
            if (!a.completedAt) return 1
            if (!b.completedAt) return -1
            return b.completedAt.getTime() - a.completedAt.getTime()
        })
    } catch (error) {
        console.error('Erro ao buscar avaliações do usuário:', error)
        return []
    }
}

/**
 * Monta a lista de avaliações concluídas a partir de `users.certifications`,
 * mesma fonte de verdade do contador em Ranking (Habilidades Diferenciais) e da seção Avaliações Realizadas.
 */
export async function getUserAssessmentsFromCertifications(
    userId: string,
    certifications: string[] | null | undefined
): Promise<UserAssessment[]> {
    try {
        const supabase = await createClient()
        const catalog = await getAssessmentsFromCatalog(supabase)
        const idBySlug = Object.fromEntries(catalog.map((a) => [a.slug, a.id]))
        const normalized = new Set((certifications ?? []).map((c) => c.toLowerCase()))
        const assessments: UserAssessment[] = []

        if (normalized.has('fivemind')) {
            const id = idBySlug['five-mind']
            const config = getAssessmentById('five-mind')
            if (id && config) {
                const { data: fiveMindData } = await supabase
                    .from('five_mind_results')
                    .select('completed_at')
                    .eq('user_id', userId)
                    .order('completed_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                assessments.push({
                    assessmentId: id,
                    assessmentConfig: config,
                    hasResult: true,
                    completedAt: fiveMindData
                        ? new Date((fiveMindData as { completed_at: string }).completed_at)
                        : undefined,
                })
            }
        }

        if (normalized.has('sixmind')) {
            const id = idBySlug['hexa-mind']
            const config = getAssessmentById('hexa-mind')
            if (id && config) {
                const { data: hexaMindData } = await supabase
                    .from('hexa_mind_results')
                    .select('completed_at')
                    .eq('user_id', userId)
                    .order('completed_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                assessments.push({
                    assessmentId: id,
                    assessmentConfig: config,
                    hasResult: true,
                    completedAt: hexaMindData
                        ? new Date((hexaMindData as { completed_at: string }).completed_at)
                        : undefined,
                })
            }
        }

        return assessments.sort((a, b) => {
            if (!a.completedAt) return 1
            if (!b.completedAt) return -1
            return b.completedAt.getTime() - a.completedAt.getTime()
        })
    } catch (error) {
        console.error('Erro ao montar avaliações a partir de certifications:', error)
        return []
    }
}

