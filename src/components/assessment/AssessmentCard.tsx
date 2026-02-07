"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import type { AssessmentConfig } from '@/types/assessments';

interface AssessmentCardProps {
    assessment: AssessmentConfig;
    onStart: () => void;
    /** Chamado ao clicar em "Avaliação concluída" para ver os resultados (opcional). */
    onViewResults?: () => void;
    completed?: boolean;
    /** Se o usuário já adquiriu (comprou) esta avaliação. */
    purchased?: boolean;
    /** Preço em centavos (exibido no card quando informado). */
    priceCents?: number;
}

export default function AssessmentCard({ assessment, onStart, onViewResults, completed, purchased, priceCents }: AssessmentCardProps) {
    const priceFormatted = priceCents != null
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceCents / 100)
        : null;
    return (
        <Card className="flex h-full flex-col p-4 sm:p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-1 flex-col gap-4">
                {/* Header + tag Adquirido */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-100">
                        {assessment.image ? (
                            <img
                                src={assessment.image}
                                alt={assessment.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                <span className="text-lg font-bold text-blue-600">{assessment.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                            <h3 className="text-lg font-bold text-slate-900">
                                {assessment.name}
                            </h3>
                            {purchased && (
                                <span className="rounded-full bg-[#5e9ea0]/15 px-2.5 py-0.5 text-xs font-semibold text-[#5e9ea0]">
                                    Adquirido
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                            {assessment.description}
                        </p>
                    </div>
                </div>

                {/* Bloco alinhado ao bottom: minutos/questões/preço + Ver resultados + botão */}
                <div className="mt-auto flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#5e9ea0]" />
                            <span>{assessment.estimatedTime}</span>
                        </div>
                        <div>
                            <span>{assessment.questionCount} questões</span>
                        </div>
                        {priceFormatted != null && (
                            <div className="font-semibold text-[#5e9ea0]">
                                {priceFormatted}
                            </div>
                        )}
                    </div>

                    {completed && (
                        onViewResults ? (
                            <button
                                type="button"
                                onClick={onViewResults}
                                className="w-full p-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-colors text-left cursor-pointer"
                            >
                                <p className="text-xs sm:text-sm text-green-800 text-center">
                                    ✓ Avaliação concluída — <span className="underline font-medium">Ver resultados</span>
                                </p>
                            </button>
                        ) : (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-xs sm:text-sm text-green-800 text-center">
                                    ✓ Avaliação concluída
                                </p>
                            </div>
                        )
                    )}

                    <Button
                        onClick={onStart}
                        className="w-full bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white"
                    >
                        {completed ? 'Refazer Avaliação' : 'Iniciar Avaliação'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

