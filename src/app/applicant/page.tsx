import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ApplicantHomeClient from './ApplicantHomeClient'
import { getOrCreateUserProfile } from '@/lib/user/serverUserService'
import { getUserAssessmentsServer, type UserAssessment } from '@/lib/assessment/serverAssessmentService'
import { Loader2 } from 'lucide-react'
import type { UserProfile } from '@/components/AuthClientProvider'

/**
 * Página server-side que busca TODOS os dados antes de renderizar
 * Isso elimina race conditions e problemas de sincronização
 */
export default async function ApplicantHome() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Se não há usuário autenticado, redirecionar para login
    if (!user) {
        redirect('/login')
    }

    // Buscar TODOS os dados em paralelo no servidor
    const [profile, assessments] = await Promise.all([
        getOrCreateUserProfile(user.id, user.email, user.user_metadata?.full_name),
        getUserAssessmentsServer(user.id),
    ])

    // Se não conseguiu criar/buscar o perfil, mostrar loading
    // (isso não deve acontecer, mas é uma segurança)
    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5e9ea0]" />
                    <p className="text-sm text-slate-600">Carregando seu perfil...</p>
                </div>
            </div>
        )
    }

    // Passar todos os dados como props para o componente client
    return (
        <ApplicantHomeClient
            user={user}
            profile={profile}
            initialAssessments={assessments}
        />
    )
}
