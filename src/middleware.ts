import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const response = await updateSession(request)
    // Expor o pathname atual para server components via headers()
    try {
        response.headers.set('x-url-pathname', request.nextUrl.pathname)
    } catch { }
    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}