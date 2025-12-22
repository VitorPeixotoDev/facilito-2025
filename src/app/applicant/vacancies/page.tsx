import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { fetchAvailableJobs, fetchUserApplications } from '@/lib/vacancies/serverVacancyService';
import VagasPageClient from '@/components/applicant/vacancies/VagasPageClient';
import { isValidUserApp } from '@/utils/auth/appType';

/**
 * Página de Vagas (Server Component)
 * Busca vagas disponíveis e candidaturas do usuário no servidor
 */
export default async function VagasPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Redireciona se não autenticado ou não tem app_type válido
    if (!user || !isValidUserApp(user)) {
        redirect('/login');
    }

    // Buscar dados em paralelo
    const [jobs, candidaturas] = await Promise.all([
        fetchAvailableJobs(),
        fetchUserApplications(user.id),
    ]);

    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#e3f2f3] to-slate-100">
                    <div className="flex items-center justify-center min-h-screen">
                        <p className="text-slate-600">Carregando vagas...</p>
                    </div>
                </div>
            }
        >
            <VagasPageClient initialJobs={jobs} initialCandidaturas={candidaturas} />
        </Suspense>
    );
}
