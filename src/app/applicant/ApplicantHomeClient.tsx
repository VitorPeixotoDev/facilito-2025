"use client";

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111] mb-2">
                    Meu Perfil
                </h1>
                <p className="text-slate-600 text-sm sm:text-base">
                    Visualize suas informações e resultados de avaliações
                </p>
            </div>

            {/* Ranking Section */}
            {profile && (
                <div className="mb-6">
                    <UserRanking
                        profile={profile}
                        userId={user.id}
                        userRanking={rankingResult?.user || null}
                        loading={loadingRanking}
                    />
                </div>
            )}

            {/* Ranked Candidates List (com expansão/recolhimento) */}
            {rankingResult && (
                <div className="mb-6">
                    <div className="bg-white rounded-lg border border-[#5f9ea0]/20 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setIsRankingExpanded((prev) => !prev)}
                            className="w-full flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5"
                        >
                            <div className="text-left">
                                <h2 className="text-sm sm:text-base font-semibold text-[#111]">
                                    Top 20 Candidatos Similares
                                </h2>
                                <p className="mt-1 text-xs sm:text-sm text-[#111]/60">
                                    {rankingResult.rankedCandidates.length > 0
                                        ? `${rankingResult.stats.relevantCandidates || rankingResult.stats.withinRadius
                                        } candidatos com habilidades similares em um raio de 20km`
                                        : 'Veja como você se posiciona em relação a outros candidatos semelhantes.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#5f9ea0]">
                                <span>{isRankingExpanded ? 'Recolher' : 'Ver ranking'}</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform duration-200 ${isRankingExpanded ? 'rotate-180' : ''
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
                                            <div className="mb-4 bg-gradient-to-br from-[#5f9ea0]/10 to-[#5f9ea0]/5 rounded-lg border-l-[3px] border-[#5f9ea0] p-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-[#5f9ea0] flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm sm:text-base font-semibold text-[#111] mb-1">
                                                            Você não está entre os top 20 candidatos similares
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-[#111]/70">
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
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#5f9ea0]/40 mx-auto" />
                                        </div>
                                        <p className="text-sm sm:text-base font-semibold text-[#111] mb-2">
                                            Nenhum candidato similar encontrado
                                        </p>
                                        <p className="text-xs sm:text-sm text-[#111]/60">
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

            {/* Avaliações Realizadas */}
            <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                    Avaliações Realizadas
                </h2>
                {userAssessments.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 shadow-sm p-6">
                        <p className="text-slate-600 text-center">
                            Nenhuma avaliação realizada ainda.
                            <a
                                href="/applicant/shop"
                                className="text-[#5e9ea0] hover:text-[#4a8b8f] font-medium ml-1"
                            >
                                Realize uma avaliação
                            </a>
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
