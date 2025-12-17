import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginPageClient from './LoginPageClient'

/**
 * Página server-side que verifica autenticação antes de renderizar
 * Se o usuário já estiver autenticado, redireciona para /applicant
 * Segue o padrão da aplicação de referência que funciona perfeitamente
 */
export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Se há usuário autenticado, redirecionar para /applicant
    if (user) {
        redirect('/applicant')
    }

    // Se não há usuário, renderizar o componente client-side
    return <LoginPageClient />
}
