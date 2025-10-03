/**
 * Função para obter a URL correta baseada no ambiente
 * Resolve o problema de redirecionamento para localhost em produção
 */
export function getURL(): string {
    // Verificar se estamos em produção (Vercel)
    const isProduction = process.env.NODE_ENV === 'production'
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    let url: string

    if (isProduction) {
        // Em produção, priorizar NEXT_PUBLIC_SITE_URL ou usar Vercel URL
        url = siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'https://nexo-fawn.vercel.app')
    } else {
        // Em desenvolvimento, usar localhost
        url = 'http://localhost:3000'
    }

    // Certifique-se de incluir uma barra `/` no final
    url = url.endsWith('/') ? url : `${url}/`

    return url
}
