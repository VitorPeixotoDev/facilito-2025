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
            <div className="overflow-hidden rounded-[1.5rem] border border-[#c8d9da] bg-white shadow-sm">
                {/* Cabeçalho com botão de expandir/retrair */}
                <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="flex w-full items-start justify-between gap-3 bg-gradient-to-br from-[#f9fcfc] to-[#f3f8f8] px-4 py-3.5 sm:px-5 sm:py-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#5e9ea0]/12 text-[#4c8587] sm:h-11 sm:w-11">
                            <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                            <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-xl">
                                Como você pode subir ainda mais no ranking
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-base">
                                Sugestões de formações e avaliações alinhadas ao seu perfil atual para fortalecer seu
                                score e se destacar entre candidatos similares.
                            </p>
                            {userScore !== null && (
                                <p className="mt-2 w-full rounded-xl border border-[#5e9ea0]/20 bg-[#5e9ea0]/5 px-3 py-2 text-xs leading-relaxed text-[#111] sm:text-sm">
                                    Seu score atual é{' '}
                                    <span className="font-semibold text-[#5e9ea0]">
                                        {userScore.toFixed(1)} / 100
                                    </span>
                                    . Cada nova formação relevante ajuda a aproximar você dos perfis mais bem colocados.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="ml-2 flex items-center gap-2 rounded-full bg-[#5f9ea0]/10 px-3 py-1.5 text-xs font-semibold text-[#3d7678] sm:ml-4 sm:text-sm">
                        <span>{isExpanded ? 'Recolher' : 'Ver sugestões'}</span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 sm:h-5 sm:w-5 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>

                {isExpanded && (
                    <div className="border-t border-[#5f9ea0]/15 px-4 py-4 sm:px-5 sm:py-5">
                        <div className="space-y-5 sm:space-y-6">
                            {/* Recomendações de cursos */}
                            {Object.keys(coursesByTheme).length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-base font-semibold text-slate-900 sm:text-lg">
                                        Sugestões de cursos por tema
                                    </h3>
                                    <p className="mb-3 text-xs text-slate-600 sm:text-sm">
                                        Cursos ajudam a compor até 60% do seu score no ranking. Foque em formações que
                                        complementem suas habilidades atuais.
                                    </p>

                                    <div className="space-y-4">
                                        {Object.entries(coursesByTheme).map(([theme, recs]) => (
                                            <div key={theme} className="rounded-2xl border border-[#dbe8e8] bg-[#f8fbfb] p-3.5 sm:p-4">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <p className="text-sm font-semibold text-slate-900 sm:text-base">
                                                        {theme}
                                                    </p>
                                                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:text-xs">
                                                        {recs.length} sugestão(ões)
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {recs.map((course) => (
                                                        <div
                                                            key={course.courseName}
                                                            className="cursor-pointer rounded-xl border border-[#dbe8e8] bg-white px-3 py-2.5 transition-colors hover:bg-[#f7fbfb]"
                                                            onClick={() => handleCourseCardClick(course.courseName)}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5e9ea0]" />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-slate-900 sm:text-base">
                                                                    {course.courseName}
                                                                    </p>
                                                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
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
                                                                        <p className="mt-0.5 text-xs text-emerald-700 sm:text-sm">
                                                                            Ao concluir este curso, seu score poderia aumentar em aproximadamente{' '}
                                                                            <span className="font-semibold">
                                                                                +{course.deltaScore.toFixed(1)} ponto(s)
                                                                            </span>
                                                                            .
                                                                        </p>
                                                                    )}
                                                                    {course.matchedSkills.length > 0 && (
                                                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#5e9ea0] sm:text-sm">
                                                                            <ArrowRight className="h-4 w-4" />
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
                                    <h3 className="mb-2 text-base font-semibold text-slate-900 sm:text-lg">
                                        Sugestões de avaliações por tema
                                    </h3>
                                    <p className="mb-3 text-xs text-slate-600 sm:text-sm">
                                        Avaliações geram análises de perfil e habilidades diferenciais que funcionam como
                                        multiplicadores no seu score.
                                    </p>
                                    <div className="space-y-3">
                                        {Object.entries(assessmentsByTag).map(([tag, recs]) => (
                                            <div key={tag} className="rounded-2xl border border-[#dbe8e8] bg-[#f8fbfb] p-3.5 sm:p-4">
                                                <p className="mb-2 text-sm font-semibold text-slate-900 sm:text-base">
                                                    {tag}
                                                </p>
                                                <div className="space-y-2">
                                                    {recs.map((assessment) => (
                                                        <div
                                                            key={assessment.assessmentId}
                                                            className="cursor-pointer rounded-xl border border-[#dbe8e8] bg-white px-3 py-2.5 transition-colors hover:bg-[#f7fbfb]"
                                                            onClick={() => handleAssessmentCardClick(assessment.assessmentName)}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5e9ea0]" />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-sm font-medium text-slate-900 sm:text-base">
                                                                    {assessment.assessmentName}
                                                                    {assessment.alreadyCompleted && (
                                                                        <span className="ml-1 text-xs font-medium text-emerald-600 sm:text-sm">
                                                                            (já concluída)
                                                                        </span>
                                                                    )}
                                                                    </p>
                                                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                                                    Testes dessa categoria ajudam a traduzir seu perfil em dados
                                                                    objetivos, que podem ser usados para destacar seu fit nas
                                                                    futuras oportunidades.
                                                                    </p>
                                                                    {assessment.deltaScore > 0.05 && (
                                                                        <p className="mt-0.5 text-xs text-emerald-700 sm:text-sm">
                                                                            Completar ou atualizar esta avaliação poderia adicionar cerca de{' '}
                                                                            <span className="font-semibold">
                                                                                +{assessment.deltaScore.toFixed(1)} ponto(s)
                                                                            </span>{' '}
                                                                            ao seu score total.
                                                                        </p>
                                                                    )}
                                                                </div>
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
