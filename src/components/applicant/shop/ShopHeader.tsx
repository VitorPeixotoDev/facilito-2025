"use client";

import { ClipboardCheck } from "lucide-react";

/**
 * Header da página de Carreira (Shop)
 * Ajusta o texto conforme a aba ativa (Avaliações x Ed. Profissional)
 */
interface ShopHeaderProps {
    activeTab: "avaliacoes" | "ed-profissional";
}

export function ShopHeader({ activeTab }: ShopHeaderProps) {
    const isProfessionalTab = activeTab === "ed-profissional";

    const title = isProfessionalTab ? "Educação Profissional" : "Avaliações";
    const description = isProfessionalTab
        ? "Vá além do currículo tradicional: obtenha certificações estratégicas que destacam seu perfil e impulsionam sua posição no mercado."
        : "Fortaleça sua candidatura! Use as avaliações para evidenciar seu perfil profissional e atrair melhores oportunidades.";

    return (
        <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm pt-3 sm:pt-4 lg:top-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                    <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#5e9ea0]" />
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                        {title}
                    </h1>
                </div>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed pl-8 sm:pl-10">
                    {description}
                </p>
            </div>
        </div>
    );
}
