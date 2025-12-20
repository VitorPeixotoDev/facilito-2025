/**
 * Serviço client-side para gerenciar candidaturas
 * Armazena no localStorage como fallback quando a tabela job_applications não existe
 */

/**
 * Obtém candidaturas do localStorage (fallback)
 */
export function getCandidaturasFromStorage(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem('candidaturas') || '[]');
    } catch {
        return [];
    }
}

/**
 * Salva candidaturas no localStorage (fallback)
 */
export function saveCandidaturasToStorage(jobIds: string[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('candidaturas', JSON.stringify(jobIds));
        window.dispatchEvent(new Event('candidaturasChanged'));
    } catch (error) {
        console.error('Erro ao salvar candidaturas no localStorage:', error);
    }
}

/**
 * Adiciona candidatura ao localStorage (fallback)
 */
export function addCandidaturaToStorage(jobId: string): void {
    const current = getCandidaturasFromStorage();
    if (!current.includes(jobId)) {
        saveCandidaturasToStorage([...current, jobId]);
    }
}

/**
 * Remove candidatura do localStorage (fallback)
 */
export function removeCandidaturaFromStorage(jobId: string): void {
    const current = getCandidaturasFromStorage();
    saveCandidaturasToStorage(current.filter((id) => id !== jobId));
}
