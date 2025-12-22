import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidUserApp } from '@/utils/auth/appType'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This is required to refresh the session and keep the user logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Verificar app_type: apenas usuários com app_type = 'user' podem acessar esta aplicação
    // Se o usuário existe mas não tem app_type válido, fazer signOut e redirecionar para login
    const pathname = request.nextUrl.pathname
    const isProtectedRoute = pathname.startsWith('/applicant') || pathname.startsWith('/auth/reset-password')

    if (user && isProtectedRoute && !isValidUserApp(user)) {
        // Usuário não pertence a esta aplicação, fazer signOut
        await supabase.auth.signOut({ scope: 'global' })

        // Redirecionar para login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'app_type_mismatch')
        return NextResponse.redirect(loginUrl)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}