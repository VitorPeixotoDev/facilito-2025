import { headers } from 'next/headers'

import { getURL } from './get-url'

function trimTrailingSlashes(s: string): string {
    return s.replace(/\/+$/, '')
}

/**
 * Base URL (sem barra final) para redirectTo / emailRedirectTo do Supabase Auth.
 * Na Vercel usa getURL(). Fora da Vercel usa o host da requisição (mesma origem do PKCE),
 * para o redirect bater com "Redirect URLs" no painel do Supabase.
 */
export async function getAuthRedirectBase(): Promise<string> {
    if (process.env.VERCEL === '1') {
        return trimTrailingSlashes(getURL())
    }

    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    if (!host) {
        return trimTrailingSlashes(getURL())
    }

    const forwardedProto = h.get('x-forwarded-proto')
    const isLocal =
        host.startsWith('localhost') ||
        host.startsWith('127.0.0.1') ||
        host.startsWith('[::1]')
    const proto = forwardedProto ?? (isLocal ? 'http' : 'https')

    return `${proto}://${host}`
}

export async function authCallbackRedirectTo(): Promise<string> {
    return `${await getAuthRedirectBase()}/auth/callback`
}

export async function authResetPasswordRedirectTo(): Promise<string> {
    return `${await getAuthRedirectBase()}/auth/reset-password`
}
