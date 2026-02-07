"use client";

import { useEffect, useState } from 'react';
import AssessmentModal from '@/components/assessment/AssessmentModal';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getAssessmentDetails, type AssessmentDetails } from '@/lib/assessment/assessmentDetailsService';
import { getAuthorizedCompetencies } from '@/lib/assessment/authorizedCompetenciesService';
import type { AssessmentConfig } from '@/types/assessments';

interface AssessmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: AssessmentConfig;
    userId: string;
}

const FIVE_MIND_LABELS: Record<string, { name: string; description: string }> = {
    openness: { name: 'Abertura à Experiência', description: 'Criatividade, curiosidade e abertura a novas ideias' },
    conscientiousness: { name: 'Conscienciosidade', description: 'Organização, disciplina e responsabilidade' },
    extraversion: { name: 'Extroversão', description: 'Sociabilidade, assertividade e energia' },
    agreeableness: { name: 'Amabilidade', description: 'Empatia, cooperação e confiança' },
    neuroticism: { name: 'Estabilidade Emocional', description: 'Resiliência, calma e controle emocional' },
};

const HEXA_MIND_LABELS: Record<string, { name: string; description: string }> = {
    honesty: { name: 'Honestidade/Humildade', description: 'Integridade, transparência, ausência de arrogância' },
    emotional_stability: { name: 'Estabilidade Emocional', description: 'Resiliência, calma, segurança' },
    extraversion: { name: 'Extroversão', description: 'Assertividade, interação social, energia' },
    agreeableness: { name: 'Amabilidade', description: 'Cooperatividade, empatia, paciência' },
    conscientiousness: { name: 'Conscienciosidade', description: 'Organização, disciplina, responsabilidade' },
    openness: { name: 'Abertura à Experiência', description: 'Criatividade, curiosidade, imaginação' },
    consistency: { name: 'Consistência', description: 'Coerência nas respostas' },
    // responseConsistency: { name: 'Consistência de Resposta', description: 'Consistência nas respostas do questionário' },
};

export default function AssessmentDetailsModal({
    isOpen,
    onClose,
    assessment,
    userId,
}: AssessmentDetailsModalProps) {
    const [details, setDetails] = useState<AssessmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorizedCompetencies, setAuthorizedCompetencies] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            setError(null);

            // Buscar detalhes da avaliação e competências autorizadas em paralelo
            const slug = (assessment as { slug?: string }).slug ?? (assessment.id === 'five-mind' || assessment.id === 'hexa-mind' ? assessment.id : assessment.id);
            Promise.all([
                getAssessmentDetails(userId, slug),
                getAuthorizedCompetencies(userId)
            ])
                .then(([data, competencies]) => {
                    setDetails(data);
                    setAuthorizedCompetencies(competencies || []);
                    if (!data) {
                        setError('Não foi possível carregar os detalhes da avaliação.');
                    }
                })
                .catch((err) => {
                    console.error('Erro ao buscar detalhes:', err);
                    setError('Erro ao carregar os detalhes da avaliação.');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setDetails(null);
            setAuthorizedCompetencies([]);
            setLoading(false);
        }
    }, [isOpen, userId, assessment.id]);

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

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const slug = (assessment as { slug?: string }).slug ?? (assessment.id === 'five-mind' || assessment.id === 'hexa-mind' ? assessment.id : 'five-mind');
    const labels = slug === 'five-mind' ? FIVE_MIND_LABELS : HEXA_MIND_LABELS;

    return (
        <AssessmentModal isOpen={isOpen} onClose={onClose} title={assessment.name}>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5e9ea0]" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : !details ? (
                <div className="text-center py-12">
                    <p className="text-slate-600">Nenhum resultado encontrado para esta avaliação.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Data de realização */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-600 mb-1">Data de Realização</p>
                        <p className="text-base font-semibold text-slate-900">
                            {formatDate(details.completedAt)}
                        </p>
                    </div>

                    {/* Score Geral */}
                    {/* {details.overallScore !== undefined && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <div className="text-center">
                                <p className="text-sm text-slate-600 mb-1">Score Geral</p>
                                <p className={`text-3xl sm:text-4xl font-bold ${getScoreColor(details.overallScore)}`}>
                                    {slug === 'hexa-mind'
                                        ? `${details.overallScore}/100`
                                        : details.overallScore.toFixed(1)
                                    }
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {getScoreLabel(details.overallScore)}
                                </p>
                            </div>
                        </div>
                    )} */}

                    {/* Competências Autorizadas */}
                    {authorizedCompetencies.length > 0 && (
                        <div className="space-y-3 mt-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Competências Autorizadas</h3>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex flex-wrap gap-2">
                                    {authorizedCompetencies.map((competency, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30"
                                        >
                                            {competency}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notas detalhadas */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Notas Detalhadas</h3>
                        {Object.entries(details.scores).map(([key, score]) => {
                            const label = labels[key];
                            if (!label) return null;

                            const percentage = (score / 5) * 100;

                            return (
                                <Card key={key} className="p-4 bg-slate-50">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
                                                {label.name}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                                {label.description}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className={`text-xl sm:text-2xl font-bold ${getScoreColor(score)}`}>
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
                                </Card>
                            );
                        })}
                    </div>


                </div>
            )}
        </AssessmentModal>
    );
}

