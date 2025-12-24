'use client';

import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompetencySuggestion } from '@/types/assessments';

interface CompetencySuggestionModalProps {
    isOpen: boolean;
    suggestions: string[];
    onAccept: (selectedCompetencies: string[]) => void;
    onCancel: () => void;
    disableCancel?: boolean;
}

/**
 * Modal para exibir sugestões de competências baseadas nos resultados do teste
 * Permite ao usuário selecionar quais competências deseja adicionar ao perfil
 */
export default function CompetencySuggestionModal({
    isOpen,
    suggestions,
    onAccept,
    onCancel,
    disableCancel = false,
}: CompetencySuggestionModalProps) {
    const [selectedCompetencies, setSelectedCompetencies] = useState<Set<string>>(
        new Set(suggestions) // Por padrão, todas selecionadas
    );

    if (!isOpen) return null;

    const handleToggleCompetency = (competency: string) => {
        const newSelected = new Set(selectedCompetencies);
        if (newSelected.has(competency)) {
            newSelected.delete(competency);
        } else {
            newSelected.add(competency);
        }
        setSelectedCompetencies(newSelected);
    };

    const handleAccept = () => {
        onAccept(Array.from(selectedCompetencies));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl relative max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                            Competências Sugeridas
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            Com base no seu perfil, sugerimos estas competências. Selecione as que deseja adicionar ao seu perfil público.
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-4"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                    {suggestions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-600">Nenhuma competência sugerida no momento.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {suggestions.map((competency) => {
                                const isSelected = selectedCompetencies.has(competency);
                                return (
                                    <button
                                        key={competency}
                                        type="button"
                                        onClick={() => handleToggleCompetency(competency)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-[#5e9ea0] bg-[#5e9ea0]/5'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                                                    ? 'border-[#5e9ea0] bg-[#5e9ea0]'
                                                    : 'border-slate-300 bg-white'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-sm sm:text-base font-medium ${isSelected ? 'text-slate-900' : 'text-slate-700'
                                                    }`}
                                            >
                                                {competency}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">
                            <strong>Importante:</strong> As competências selecionadas serão adicionadas ao seu perfil público e poderão ser visualizadas por recrutadores. Os resultados brutos do teste não serão expostos.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 sm:p-6">
                    <div className="flex gap-3">
                        {!disableCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={handleAccept}
                            disabled={selectedCompetencies.size === 0}
                            className={`bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white disabled:opacity-50 disabled:cursor-not-allowed ${disableCancel ? 'flex-1' : 'flex-1'
                                }`}
                        >
                            Adicionar ao Meu Perfil ({selectedCompetencies.size})
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

