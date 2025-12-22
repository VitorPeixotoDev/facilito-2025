import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/applicant'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Verificar app_type após OAuth bem-sucedido
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Se app_type existe e é diferente de 'user', fazer signOut
                if (user.user_metadata?.app_type && user.user_metadata.app_type !== 'user') {
                    await supabase.auth.signOut({ scope: 'global' })
                    return NextResponse.redirect(`${origin}/login?error=app_type_mismatch`)
                }

                // Se não existe app_type, adicionar (usuário criado via OAuth)
                if (!user.user_metadata?.app_type) {
                    await supabase.auth.updateUser({
                        data: {
                            ...user.user_metadata,
                            app_type: 'user',
                        },
                    })
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Retorna o usuário para uma página de erro com instruções
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
