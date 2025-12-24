"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import type { AssessmentConfig } from '@/types/assessments';

interface AssessmentCardProps {
    assessment: AssessmentConfig;
    onStart: () => void;
    completed?: boolean;
}

export default function AssessmentCard({ assessment, onStart, completed }: AssessmentCardProps) {
    return (
        <Card className="p-4 sm:p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-100">
                        {assessment.image ? (
                            <img
                                src={assessment.image}
                                alt={assessment.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    console.error('Erro ao carregar imagem:', e);
                                    // Fallback para um ícone padrão se a imagem falhar
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
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {assessment.name}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                            {assessment.description}
                        </p>
                    </div>
                </div>

                {/* Informações */}
                <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#5e9ea0]" />
                        <span>{assessment.estimatedTime}</span>
                    </div>
                    <div>
                        <span>{assessment.questionCount} questões</span>
                    </div>
                </div>

                {/* Status */}
                {completed && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-green-800 text-center">
                            ✓ Avaliação concluída
                        </p>
                    </div>
                )}

                {/* Botão */}
                <Button
                    onClick={onStart}
                    className="w-full bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white"
                >
                    {completed ? 'Refazer Avaliação' : 'Iniciar Avaliação'}
                </Button>
            </div>
        </Card>
    );
}

