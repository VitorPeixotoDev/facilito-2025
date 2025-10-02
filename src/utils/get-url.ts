/**
 * Função para obter a URL correta baseada no ambiente
 * Resolve o problema de redirecionamento para localhost em produção
 */
export function getURL(): string {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // URL definida manualmente para produção
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // URL automática da Vercel
        'http://localhost:3000/' // Fallback para desenvolvimento

    // Certifique-se de incluir `https://` quando não for localhost
    url = url.startsWith('http') ? url : `https://${url}`

    // Certifique-se de incluir uma barra `/` no final
    url = url.endsWith('/') ? url : `${url}/`

    return url
}
