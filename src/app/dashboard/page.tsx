import { redirect } from 'next/navigation';

/**
 * Página de dashboard removida - todos os usuários são redirecionados
 * diretamente para a área do candidato (/applicant)
 * 
 * Esta página é mantida apenas para compatibilidade com links/bookmarks antigos
 */
export default function Dashboard() {
    redirect('/applicant');
} 