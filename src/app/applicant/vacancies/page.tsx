import { Suspense } from 'react';
import { VagasPageSkeleton } from '@/components/ui/skeleton';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { fetchAvailableJobs, fetchUserApplications } from '@/lib/vacancies/serverVacancyService';
import { fetchUserProfileServer } from '@/lib/user/serverUserService';
import VagasPageClient from '@/components/applicant/vacancies/VagasPageClient';
import { isValidUserApp } from '@/utils/auth/appType';

/** Raio limite em metros para vagas presenciais/híbridas (30 km) */
export const VAGANCIES_RADIUS_M = 30_000;

/**
 * Página de Vagas (Server Component)
 * Busca vagas disponíveis, candidaturas e endereço do usuário no servidor
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

    // Buscar dados em paralelo (vagas, candidaturas e perfil para endereço)
    const [jobs, candidaturas, profile] = await Promise.all([
        fetchAvailableJobs(),
        fetchUserApplications(user.id),
        fetchUserProfileServer(user.id),
    ]);

    const userHomeAddress =
        profile?.home_address &&
            typeof profile.home_address.latitude === 'number' &&
            typeof profile.home_address.longitude === 'number'
            ? { latitude: profile.home_address.latitude, longitude: profile.home_address.longitude }
            : null;

    return (
        <Suspense fallback={<VagasPageSkeleton />}>
            <VagasPageClient
                initialJobs={jobs}
                initialCandidaturas={candidaturas}
                userHomeAddress={userHomeAddress}
                radiusM={VAGANCIES_RADIUS_M}
            />
        </Suspense>
    );
}
