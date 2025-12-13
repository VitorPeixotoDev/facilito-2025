"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FiveMindResult } from '@/types/assessments';

interface FiveMindResultsProps {
    results: FiveMindResult;
    onRestart: () => void;
}

const FACTOR_LABELS = {
    openness: { name: 'Abertura à Experiência', description: 'Criatividade, curiosidade e abertura a novas ideias' },
    conscientiousness: { name: 'Conscienciosidade', description: 'Organização, disciplina e responsabilidade' },
    extraversion: { name: 'Extroversão', description: 'Sociabilidade, assertividade e energia' },
    agreeableness: { name: 'Amabilidade', description: 'Empatia, cooperação e confiança' },
    neuroticism: { name: 'Estabilidade Emocional', description: 'Resiliência, calma e controle emocional' },
};

export default function FiveMindResults({ results, onRestart }: FiveMindResultsProps) {
    const { results: scores } = results;

    const getScoreColor = (score: number) => {
        if (score >= 4) return 'text-green-600';
        if (score >= 3) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 4) return 'bg-green-500';
        if (score >= 3) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 4.5) return 'Muito Alto';
        if (score >= 4) return 'Alto';
        if (score >= 3) return 'Médio';
        if (score >= 2) return 'Baixo';
        return 'Muito Baixo';
    };

    return (
        <div className="space-y-4">
            <Card className="p-4 sm:p-6 shadow-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Resultados do FiveMind
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Análise dos seus traços de personalidade
                    </p>
                </div>

                {/* Score Geral */}
                <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Score Geral</p>
                        <p className={`text-4xl font-bold ${getScoreColor(scores.overallScore)}`}>
                            {scores.overallScore.toFixed(1)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {getScoreLabel(scores.overallScore)}
                        </p>
                    </div>
                </div>

                {/* Fatores */}
                <div className="space-y-4">
                    {Object.entries(FACTOR_LABELS).map(([key, label]) => {
                        const score = scores[key as keyof typeof scores] as number;
                        const percentage = (score / 5) * 100;

                        return (
                            <div key={key} className="p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                                            {label.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                            {label.description}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                            {score.toFixed(1)}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {getScoreLabel(score)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Informações adicionais */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Nota:</strong> Estes resultados são baseados no modelo Big Five (IPIP-NEO)
                        e fornecem uma visão geral dos seus traços de personalidade.
                        Os resultados são confidenciais e podem ser compartilhados com recrutadores
                        para avaliação de fit cultural.
                    </p>
                </div>

                {/* Botão de ação */}
                <div className="mt-6 flex gap-4">
                    <Button
                        onClick={onRestart}
                        className="flex-1 bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white"
                    >
                        Fazer Novamente
                    </Button>
                </div>
            </Card>

            <div className="text-center text-slate-500 text-xs sm:text-sm">
                <p>
                    FiveMind é uma adaptação para avaliação de fit cultural baseada no modelo
                    IPIP-NEO (Big Five). © {new Date().getFullYear()} - Uso exclusivo para processos de recrutamento.
                </p>
            </div>
        </div>
    );
}

