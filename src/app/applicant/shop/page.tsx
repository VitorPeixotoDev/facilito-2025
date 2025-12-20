import { Suspense } from 'react';
import ShopPageClient from '@/components/applicant/shop/ShopPageClient';

/**
 * Página de Carreira (Shop)
 *
 * Server Component que delega a lógica de estado e leitura de search params
 * para o componente client-side `ShopPageClient`, envolvido em Suspense
 * conforme recomendação do Next para hooks como `useSearchParams`.
 */
export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 pb-24" />}>
            <ShopPageClient />
        </Suspense>
    );
}
