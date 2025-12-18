"use client";

import { useState } from "react";
import { ShopHeader } from "@/components/applicant/shop/ShopHeader";
import { ShopTabs, TabId } from "@/components/applicant/shop/ShopTabs";

/**
 * Página de Carreira (Shop)
 *
 * Exibe as avaliações disponíveis para o usuário completar
 * e filtros de Educação Profissional.
 *
 * @see /docs/ASSESSMENT/ASSESSMENTS_README.md para mais informações sobre o sistema de avaliações
 */
export default function ShopPage() {
    const [activeTab, setActiveTab] = useState<TabId>("avaliacoes");

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <ShopHeader activeTab={activeTab} />

            <div className="max-w-4xl mx-auto p-4 lg:p-6">
                <ShopTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        </div>
    );
}
