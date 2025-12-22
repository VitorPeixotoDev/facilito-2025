import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginPageClient from './LoginPageClient'
import { isValidUserApp } from '@/utils/auth/appType'

/**
 * Página server-side que verifica autenticação antes de renderizar
 * Se o usuário já estiver autenticado com app_type válido, redireciona para /applicant
 * Segue o padrão da aplicação de referência que funciona perfeitamente
 */
export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Se há usuário autenticado com app_type válido, redirecionar para /applicant
    if (user && isValidUserApp(user)) {
        redirect('/applicant')
    }

    // Se usuário existe mas não tem app_type válido, fazer signOut
    if (user && !isValidUserApp(user)) {
        await supabase.auth.signOut({ scope: 'global' })
    }

    // Se não há usuário válido, renderizar o componente client-side
    return <LoginPageClient />
}
