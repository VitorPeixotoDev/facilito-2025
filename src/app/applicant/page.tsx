import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ApplicantHomeClient from './ApplicantHomeClient'
import { getOrCreateUserProfile } from '@/lib/user/serverUserService'
import { getUserAssessmentsFromCertifications, type UserAssessment } from '@/lib/assessment/serverAssessmentService'
import { FullPageSkeleton } from '@/components/ui/skeleton'
import type { UserProfile } from '@/components/AuthClientProvider'
import { isValidUserApp } from '@/utils/auth/appType'

/**
 * Página server-side que busca TODOS os dados antes de renderizar
 * Isso elimina race conditions e problemas de sincronização
 */
export default async function ApplicantHome() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Se não há usuário autenticado ou não tem app_type válido, redirecionar para login
    if (!user || !isValidUserApp(user)) {
        redirect('/login')
    }

    const profile = await getOrCreateUserProfile(user.id, user.email, user.user_metadata?.full_name)

    // Se não conseguiu criar/buscar o perfil, mostrar loading
    // (isso não deve acontecer, mas é uma segurança)
    if (!profile) {
        return <FullPageSkeleton label="Carregando seu perfil" />
    }

    const assessments: UserAssessment[] = await getUserAssessmentsFromCertifications(
        user.id,
        profile.certifications
    )

    // Passar todos os dados como props para o componente client
    return (
        <ApplicantHomeClient
            user={user}
            profile={profile}
            initialAssessments={assessments}
        />
    )
}
