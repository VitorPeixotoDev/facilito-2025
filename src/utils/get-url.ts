/**
 * Função para obter a URL correta baseada no ambiente
 * Resolve o problema de redirecionamento para localhost em produção
 */
export function getURL(): string {
    // Para garantir que sempre use a URL de produção quando estiver em produção
    // Verificar se estamos rodando na Vercel
    const isVercel = process.env.VERCEL === '1'
    const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    // Debug logging
    console.log('getURL Debug:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        isVercel,
        vercelUrl,
        siteUrl
    })

    let url: string

    // Se estiver na Vercel (produção), sempre usar URL de produção
    if (isVercel) {
        url = siteUrl || (vercelUrl ? `https://${vercelUrl}` : 'https://nexo-fawn.vercel.app')
    } else {
        // Apenas em desenvolvimento local usar localhost
        url = 'http://localhost:3000'
    }

    // Certifique-se de incluir uma barra `/` no final
    url = url.endsWith('/') ? url : `${url}/`

    console.log('getURL Result:', url)

    return url
}
