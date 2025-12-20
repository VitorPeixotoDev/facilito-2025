'use client';

import { useState } from 'react';
import { Lightbulb, ArrowRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { RankingResult } from '@/lib/ranking/types';
import type { UserProfile } from '@/components/AuthClientProvider';
import type { UserAssessment } from '@/lib/assessment/serverAssessmentService';
import { buildUserRecommendations, type UserSignals } from '@/lib/recommendations/userRecommendations';

interface RecommendationsSectionProps {
    profile: UserProfile;
    rankingResult: RankingResult | null;
    userAssessments: UserAssessment[];
}

/**
 * Section de recomendações personalizadas (cursos + avaliações)
 * Renderizada entre o ranking e o perfil do usuário, com dropdown expandir/retrair.
 */
export function RecommendationsSection({ profile, rankingResult, userAssessments }: RecommendationsSectionProps) {
    const router = useRouter();

    // Monta os sinais mínimos para o motor de recomendações
    const signals: UserSignals = {
        skills: profile.skills || [],
        courses: profile.courses || [],
        profileAnalysis: profile.profile_analysis || [],
        completedAssessmentIds: userAssessments.map((a) => a.assessmentId),
    };

    const { coursesByTheme, assessmentsByTag } = buildUserRecommendations(signals, 5);

    const userScore = rankingResult?.user?.finalScore ?? null;

    // Se não houver nenhuma recomendação ainda, não renderizar a seção
    if (
        (!coursesByTheme || Object.keys(coursesByTheme).length === 0) &&
        (!assessmentsByTag || Object.keys(assessmentsByTag).length === 0)
    ) {
        return null;
    }

    const [isExpanded, setIsExpanded] = useState(false);

    const handleCourseCardClick = (courseName: string) => {
        router.push(`/applicant/shop?tab=ed-profissional&q=${encodeURIComponent(courseName)}`);
    };

    const handleAssessmentCardClick = (assessmentName: string) => {
        router.push(`/applicant/shop?tab=avaliacoes&q=${encodeURIComponent(assessmentName)}`);
    };

    return (
        <section className="mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                {/* Cabeçalho com botão de expandir/retrair */}
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="w-full flex items-start justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#5e9ea0]/10 text-[#5e9ea0]">
                            <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                                Como você pode subir ainda mais no ranking
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-600">
                                Sugestões de formações e avaliações alinhadas ao seu perfil atual para fortalecer seu
                                score e se destacar entre candidatos similares.
                            </p>
                            {userScore !== null && (
                                <p className="mt-2 w-full bg-[#5e9ea0]/5 px-3 py-2 text-[11px] sm:text-xs text-[#111] border border-[#5e9ea0]/20">
                                    Seu score atual é{' '}
                                    <span className="font-semibold text-[#5e9ea0]">
                                        {userScore.toFixed(1)} / 100
                                    </span>
                                    . Cada nova formação relevante ajuda a aproximar você dos perfis mais bem colocados.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5e9ea0] ml-2 sm:ml-4">
                        <span>{isExpanded ? 'Recolher' : 'Ver sugestões'}</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                {isExpanded && (
                    <div className="border-t border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
                        <div className="space-y-5 sm:space-y-6">
                            {/* Recomendações de cursos */}
                            {Object.keys(coursesByTheme).length > 0 && (
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
                                        Sugestões de cursos por tema
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-slate-600 mb-3">
                                        Cursos ajudam a compor até 60% do seu score no ranking. Foque em formações que
                                        complementem suas habilidades atuais.
                                    </p>

                                    <div className="space-y-4">
                                        {Object.entries(coursesByTheme).map(([theme, recs]) => (
                                            <div key={theme} className="border border-slate-100 rounded-xl p-3 sm:p-4 bg-slate-50/60">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                                                        {theme}
                                                    </p>
                                                    <span className="text-[10px] sm:text-[11px] text-slate-500">
                                                        {recs.length} sugestão(ões)
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {recs.map((course) => (
                                                        <div
                                                            key={course.courseName}
                                                            className="flex items-start gap-2 rounded-lg bg-white/80 border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => handleCourseCardClick(course.courseName)}
                                                        >
                                                            <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#5e9ea0] flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs sm:text-sm font-medium text-slate-900">
                                                                    {course.courseName}
                                                                </p>
                                                                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-600">
                                                                    {course.levelLabel === 'Técnico / Livre' &&
                                                                        'Boa porta de entrada rápida para fortalecer seu histórico de cursos.'}
                                                                    {course.levelLabel === 'Graduação' &&
                                                                        'Uma graduação relevante aumenta de forma consistente a parcela de cursos no seu score.'}
                                                                    {course.levelLabel === 'Pós-graduação / MBA' &&
                                                                        'Pós-graduações e MBAs sinalizam especialização e podem diferenciar você em vagas disputadas.'}
                                                                    {course.levelLabel === 'Mestrado / Doutorado' &&
                                                                        'Formações stricto sensu têm forte impacto em posições que valorizam pesquisa e senioridade.'}
                                                                </p>
                                                                {course.deltaScore > 0.05 && (
                                                                    <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-700">
                                                                        Ao concluir este curso, seu score poderia aumentar em aproximadamente{' '}
                                                                        <span className="font-semibold">
                                                                            +{course.deltaScore.toFixed(1)} ponto(s)
                                                                        </span>
                                                                        .
                                                                    </p>
                                                                )}
                                                                {course.matchedSkills.length > 0 && (
                                                                    <p className="mt-0.5 text-[10px] sm:text-xs text-[#5e9ea0] flex items-center gap-1">
                                                                        <ArrowRight className="w-3 h-3" />
                                                                        Potencializa habilidades que você já declarou, como
                                                                        <span className="font-medium">
                                                                            {' '}
                                                                            {course.matchedSkills.slice(0, 2).join(', ')}
                                                                            {course.matchedSkills.length > 2 && ' e outras'}
                                                                        </span>
                                                                        .
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recomendações de avaliações */}
                            {Object.keys(assessmentsByTag).length > 0 && (
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
                                        Sugestões de avaliações por tema
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-slate-600 mb-3">
                                        Avaliações geram análises de perfil e habilidades diferenciais que funcionam como
                                        multiplicadores no seu score.
                                    </p>
                                    <div className="space-y-3">
                                        {Object.entries(assessmentsByTag).map(([tag, recs]) => (
                                            <div key={tag} className="border border-slate-100 rounded-xl p-3 sm:p-4 bg-slate-50/60">
                                                <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">
                                                    {tag}
                                                </p>
                                                <div className="space-y-2">
                                                    {recs.map((assessment) => (
                                                        <div
                                                            key={assessment.assessmentId}
                                                            className="flex items-start gap-2 rounded-lg bg-white/80 border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                                            onClick={() => handleAssessmentCardClick(assessment.assessmentName)}
                                                        >
                                                            <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#5e9ea0] flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs sm:text-sm font-medium text-slate-900">
                                                                    {assessment.assessmentName}
                                                                    {assessment.alreadyCompleted && (
                                                                        <span className="ml-1 text-[10px] sm:text-[11px] text-emerald-600 font-medium">
                                                                            (já concluída)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-600">
                                                                    Testes dessa categoria ajudam a traduzir seu perfil em dados
                                                                    objetivos, que podem ser usados para destacar seu fit nas
                                                                    futuras oportunidades.
                                                                </p>
                                                                {assessment.deltaScore > 0.05 && (
                                                                    <p className="mt-0.5 text-[10px] sm:text-xs text-emerald-700">
                                                                        Completar ou atualizar esta avaliação poderia adicionar cerca de{' '}
                                                                        <span className="font-semibold">
                                                                            +{assessment.deltaScore.toFixed(1)} ponto(s)
                                                                        </span>{' '}
                                                                        ao seu score total.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
