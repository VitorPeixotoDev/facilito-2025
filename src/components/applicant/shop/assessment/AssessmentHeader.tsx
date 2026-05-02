"use client";

import { ArrowLeft } from "lucide-react";

interface AssessmentHeaderProps {
    title: string;
    onBack: () => void;
    disableBack?: boolean;
}

/**
 * Header da página de avaliação individual
 * Exibe título e botão de voltar
 */
export function AssessmentHeader({ title, onBack, disableBack = false }: AssessmentHeaderProps) {
    return (
        <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm lg:top-20">
            <div className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={onBack}
                        disabled={disableBack}
                        className={`p-1.5 sm:p-2 rounded-full transition-colors active:scale-95 ${disableBack
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-slate-100'
                            }`}
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

