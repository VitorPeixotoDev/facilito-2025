/**
 * Utilitários para verificação de tipo de aplicação (app_type)
 * 
 * Esta aplicação (B) deve aceitar apenas usuários com app_type = 'user'
 * A aplicação A (recruiter) usa app_type = 'recruiter'
 */

/**
 * Verifica se o usuário tem app_type = 'user'
 */
export function isValidUserApp(user: { user_metadata?: { app_type?: string } } | null): boolean {
    if (!user) return false
    return user.user_metadata?.app_type === 'user'
}

/**
 * Verifica se o usuário pertence a outra aplicação (recruiter, etc)
 */
export function isOtherAppUser(user: { user_metadata?: { app_type?: string } } | null): boolean {
    if (!user || !user.user_metadata?.app_type) return false
    return user.user_metadata.app_type !== 'user'
}
