'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShopHeader } from '@/components/applicant/shop/ShopHeader';
import { ShopTabs, type TabId } from '@/components/applicant/shop/ShopTabs';

/**
 * Componente client-side da página de Carreira (Shop).
 * Responsável por ler query params (tab, q) e controlar o estado das abas.
 */
export default function ShopPageClient() {
    const searchParams = useSearchParams();
    const initialTabParam = searchParams.get('tab') as TabId | null;
    const initialTab: TabId = initialTabParam === 'ed-profissional' ? 'ed-profissional' : 'avaliacoes';
    const initialSearchTerm = searchParams.get('q') ?? '';

    const [activeTab, setActiveTab] = useState<TabId>(initialTab);

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <ShopHeader activeTab={activeTab} />

            <div className="max-w-4xl mx-auto p-4 lg:p-6">
                <ShopTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    initialSearchTerm={initialSearchTerm}
                />
            </div>
        </div>
    );
}
