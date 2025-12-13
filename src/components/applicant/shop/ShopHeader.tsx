"use client";

import { ClipboardCheck } from "lucide-react";

/**
 * Header da página de Carreira (Shop)
 * Exibe título e descrição da seção de avaliações
 */
export function ShopHeader() {
    return (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm pt-2 sm:pt-4">
            <div className="max-w-4xl mx-auto px-4 py-2 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#5e9ea0]" />
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Avaliações
                    </h1>
                </div>
                <p className="text-slate-600 text-sm sm:text-base">
                    Complete as avaliações para descobrir seu perfil profissional e melhorar seu fit cultural.
                </p>
            </div>
        </div>
    );
}

