"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HexaMindResult } from '@/types/assessments';

interface HexaMindResultsProps {
    results: HexaMindResult;
    onRestart: () => void;
}

const FACTOR_LABELS = {
    honesty: {
        name: 'Honestidade/Humildade',
        description: 'Integridade, transparência, ausência de arrogância',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        shortName: 'Honestidade'
    },
    emotional_stability: {
        name: 'Estabilidade Emocional',
        description: 'Resiliência, calma, segurança',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        shortName: 'Estabilidade'
    },
    extraversion: {
        name: 'Extroversão',
        description: 'Assertividade, interação social, energia',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        shortName: 'Extroversão'
    },
    agreeableness: {
        name: 'Amabilidade',
        description: 'Cooperatividade, empatia, paciência',
        color: 'bg-green-100 text-green-800 border-green-300',
        shortName: 'Amabilidade'
    },
    conscientiousness: {
        name: 'Conscienciosidade',
        description: 'Organização, disciplina, responsabilidade',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        shortName: 'Conscienciosidade'
    },
    openness: {
        name: 'Abertura à Experiência',
        description: 'Criatividade, curiosidade, imaginação',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        shortName: 'Abertura'
    },
};

export default function HexaMindResults({ results, onRestart }: HexaMindResultsProps) {
    const { results: scores } = results;

    const getScoreColor = (score: number) => {
        if (score >= 4.2) return 'text-emerald-700';
        if (score >= 3.5) return 'text-green-600';
        if (score >= 2.8) return 'text-yellow-600';
        if (score >= 2.0) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBarColor = (score: number) => {
        if (score >= 4.2) return 'bg-emerald-500';
        if (score >= 3.5) return 'bg-green-500';
        if (score >= 2.8) return 'bg-yellow-500';
        if (score >= 2.0) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 4.2) return 'Muito Alto';
        if (score >= 3.5) return 'Alto';
        if (score >= 2.8) return 'Médio';
        if (score >= 2.0) return 'Baixo';
        return 'Muito Baixo';
    };

    return (
        <div className="space-y-4">
            <Card className="p-4 sm:p-6 shadow-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                        Resultados do HexaMind
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Análise dos seus 6 fatores de personalidade
                    </p>
                </div>

                {/* Score Geral */}
                <div className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-indigo-50 rounded-lg border border-amber-200">
                    <div className="text-center">
                        <p className="text-sm text-slate-600 mb-1">Score Geral</p>
                        <p className={`text-4xl font-bold bg-gradient-to-r from-amber-600 to-indigo-600 bg-clip-text text-transparent`}>
                            {scores.overallScore}/100
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            Consistência: {scores.responseConsistency}%
                        </p>
                    </div>
                </div>

                {/* Fatores */}
                <div className="space-y-4">
                    {Object.entries(FACTOR_LABELS).map(([key, label]) => {
                        const score = scores[key as keyof typeof scores] as number;
                        const percentage = (score / 5) * 100;

                        return (
                            <div key={key} className="p-4 bg-slate-50 rounded-lg border">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${label.color}`}>
                                                {label.shortName}
                                            </span>
                                        </div>
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
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Nota:</strong> Estes resultados são baseados em 6 fatores de personalidade
                        e fornecem uma visão geral dos seus traços profissionais.
                        Os resultados são confidenciais e podem ser compartilhados com recrutadores
                        para avaliação de fit cultural.
                    </p>
                </div>

                {/* Botão de ação */}
                <div className="mt-6 flex gap-4">
                    <Button
                        onClick={onRestart}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-indigo-600 hover:opacity-90 text-white"
                    >
                        Fazer Novamente
                    </Button>
                </div>
            </Card>

            <div className="text-center text-slate-500 text-xs sm:text-sm">
                <p>
                    HexaMind - Teste de 6 Fatores de Personalidade © {new Date().getFullYear()} |
                    Instrumento válido para avaliação profissional e fit cultural
                </p>
            </div>
        </div>
    );
}

