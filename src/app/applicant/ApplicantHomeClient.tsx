"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AlertCircle, ChevronDown } from 'lucide-react';
import ProfileAnalysisBadge from '@/components/applicant/profile/ProfileAnalysisBadge';
import AssessmentDetailsModal from '@/components/applicant/profile/AssessmentDetailsModal';
import UserInfo from '@/components/applicant/profile/UserInfo';
import UserRanking from '@/components/applicant/profile/UserRanking';
import CandidateRankingList from '@/components/applicant/profile/CandidateRankingList';
import { RecommendationsSection } from '@/components/applicant/profile/RecommendationsSection';
import { fetchAndRankCandidates } from '@/lib/ranking/service';
import type { AssessmentConfig } from '@/types/assessments';
import type { RankingResult } from '@/lib/ranking/types';
import type { UserProfile } from '@/components/AuthClientProvider';
import type { UserAssessment } from '@/lib/assessment/serverAssessmentService';

interface ApplicantHomeClientProps {
    user: User;
    profile: UserProfile;
    initialAssessments: UserAssessment[];
}

export default function ApplicantHomeClient({
    user,
    profile,
    initialAssessments,
}: ApplicantHomeClientProps) {
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentConfig | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userAssessments] = useState<UserAssessment[]>(initialAssessments);
    const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);
    const [loadingRanking, setLoadingRanking] = useState(true);
    const [isRankingExpanded, setIsRankingExpanded] = useState(false);

    // Busca e ranqueia candidatos (ainda no client-side pois usa Web Workers)
    useEffect(() => {
        if (user?.id && profile) {
            setLoadingRanking(true);
            fetchAndRankCandidates(user.id)
                .then((result) => {
                    setRankingResult(result);
                })
                .catch((error: unknown) => {
                    console.error('Erro ao buscar ranking:', error);
                    setRankingResult(null);
                })
                .finally(() => {
                    setLoadingRanking(false);
                });
        } else {
            setRankingResult(null);
            setLoadingRanking(false);
        }
    }, [user?.id, profile]);

    const handleBadgeClick = (assessment: AssessmentConfig) => {
        setSelectedAssessment(assessment);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAssessment(null);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
            {/* Header */}
            <div className="mb-6 rounded-[1.75rem] border border-[#d5e3e4] bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] p-5 shadow-sm sm:mb-8 sm:p-7">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4f7f81]">
                    Painel do Candidato
                </p>
                <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">
                    Meu Perfil
                </h1>
                <p className="text-sm text-slate-600 sm:text-base">
                    Visualize suas informações e resultados de avaliações
                </p>
            </div>

            {/* Ranking Section */}
            {profile && (
                <div className="mb-6">
                    <UserRanking
                        profile={profile}
                        userRanking={rankingResult?.user || null}
                        loading={loadingRanking}
                    />
                </div>
            )}

            {/* Ranked Candidates List (com expansão/recolhimento) */}
            {rankingResult && (
                <div className="mb-6">
                    <div className="overflow-hidden rounded-[1.5rem] border border-[#c8d9da] bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => setIsRankingExpanded((prev) => !prev)}
                            className="flex w-full items-center justify-between gap-3 bg-gradient-to-br from-[#f9fcfc] to-[#f3f8f8] px-4 py-3.5 sm:px-5 sm:py-4"
                        >
                            <div className="text-left">
                                <h2 className="text-sm font-semibold text-[#111] sm:text-base">
                                    Top 20 Candidatos Similares
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-[#111]/60 sm:text-sm">
                                    {rankingResult.rankedCandidates.length > 0
                                        ? `${rankingResult.stats.relevantCandidates || rankingResult.stats.withinRadius
                                        } candidatos com habilidades similares em um raio de 20km`
                                        : 'Veja como você se posiciona em relação a outros candidatos semelhantes.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-[#5f9ea0]/10 px-3 py-1.5 text-xs font-semibold text-[#3d7678] sm:text-sm">
                                <span>{isRankingExpanded ? 'Recolher' : 'Ver ranking'}</span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform duration-200 ${isRankingExpanded ? 'rotate-180' : ''
                                        }`}
                                />
                            </div>
                        </button>

                        {isRankingExpanded && (
                            <div className="border-t border-[#5f9ea0]/15 px-4 py-4 sm:px-5 sm:py-5">
                                {rankingResult.rankedCandidates.length > 0 ? (
                                    <>
                                        {/* Alerta se usuário não está nos top 20 */}
                                        {!rankingResult.userInTop20 && rankingResult.user && (
                                            <div className="mb-4 rounded-2xl border border-[#5f9ea0]/20 bg-gradient-to-br from-[#e9f3f3] to-white p-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#5f9ea0]" />
                                                    <div>
                                                        <p className="mb-1 text-sm font-semibold text-[#111] sm:text-base">
                                                            Você não está entre os top 20 candidatos similares
                                                        </p>
                                                        <p className="text-xs text-[#111]/70 sm:text-sm">
                                                            Continue desenvolvendo suas habilidades e completando
                                                            avaliações para melhorar sua posição no ranking.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <CandidateRankingList
                                            candidates={rankingResult.rankedCandidates}
                                            loading={loadingRanking}
                                        />
                                    </>
                                ) : (
                                    <div className="rounded-2xl border border-[#e3ecec] bg-[#fbfdfd] p-5 text-center">
                                        <div className="mb-3">
                                            <AlertCircle className="mx-auto h-10 w-10 text-[#5f9ea0]/40 sm:h-12 sm:w-12" />
                                        </div>
                                        <p className="mb-2 text-sm font-semibold text-[#111] sm:text-base">
                                            Nenhum candidato similar encontrado
                                        </p>
                                        <p className="text-xs leading-relaxed text-[#111]/60 sm:text-sm">
                                            {rankingResult.stats.totalCandidates === 0
                                                ? 'Não há outros candidatos cadastrados no momento.'
                                                : `Não encontramos candidatos com habilidades similares dentro de um raio de 20km. Total de candidatos no sistema: ${rankingResult.stats.totalCandidates}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recomendações personalizadas (entre ranking e perfil) */}
            {profile && (
                <RecommendationsSection
                    profile={profile}
                    rankingResult={rankingResult}
                    userAssessments={userAssessments}
                />
            )}

            {/* Informações do Usuário */}
            {profile && (
                <div className="mb-6">
                    <UserInfo profile={profile} onAssessmentClick={handleBadgeClick} />
                </div>
            )}

            {/* Avaliações Realizadas — âncora #avaliacoes-realizadas (Ranking / Habilidades Diferenciais) */}
            <div
                id="avaliacoes-realizadas"
                className="anchor-section-avaliacoes mb-6 scroll-mt-6 rounded-[1.25rem] sm:scroll-mt-8"
            >
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                    Habilidades Diferenciais
                </p>
                <h2 className="mb-1 text-lg font-bold text-slate-900 sm:text-xl">
                    Avaliações Realizadas
                </h2>
                <p className="mb-4 text-xs text-slate-600 sm:text-sm">
                    Lista correspondente ao total do card no Ranking acima.
                </p>
                {userAssessments.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <p className="text-center text-sm text-slate-600 sm:text-base">
                            Nenhuma avaliação realizada ainda.
                            <a
                                href="/applicant/shop"
                                className="ml-1 font-semibold text-[#5e9ea0] underline decoration-[#5e9ea0]/40 underline-offset-2 hover:text-[#4a8b8f]"
                            >
                                Realize uma avaliação
                            </a>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {userAssessments.map((userAssessment) => (
                            <ProfileAnalysisBadge
                                key={userAssessment.assessmentId}
                                assessment={userAssessment.assessmentConfig}
                                onClick={() => handleBadgeClick(userAssessment.assessmentConfig)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Detalhes da Avaliação */}
            {selectedAssessment && (
                <AssessmentDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    assessment={selectedAssessment}
                    userId={user.id}
                />
            )}
        </div>
    );
}
