"use client";

import { ArrowLeft } from "lucide-react";

interface AssessmentHeaderProps {
    title: string;
    onBack: () => void;
}

/**
 * Header da página de avaliação individual
 * Exibe título e botão de voltar
 */
export function AssessmentHeader({ title, onBack }: AssessmentHeaderProps) {
    return (
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
            <div className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onBack}
                        className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                        aria-label="Voltar"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                    </button>
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex-1 truncate">
                        {title}
                    </h1>
                </div>
            </div>
        </div>
    );
}

