"use client";

import { useEffect, useState } from 'react';
import { Trophy, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { getUserAssessments } from '@/lib/assessment/userAssessmentsService';
import type { UserProfile } from '@/components/AuthClientProvider';
import type { CandidateRankingResult } from '@/lib/ranking/types';

interface UserRankingProps {
    profile: UserProfile;
    userId: string;
    userRanking?: CandidateRankingResult | null;
    loading?: boolean;
}

export default function UserRanking({ profile, userId, userRanking, loading = false }: UserRankingProps) {
    const [assessmentCount, setAssessmentCount] = useState(0);
    const [loadingAssessments, setLoadingAssessments] = useState(true);

    useEffect(() => {
        if (userId) {
            getUserAssessments(userId)
                .then((assessments) => {
                    setAssessmentCount(assessments.length);
                })
                .catch((error) => {
                    console.error('Erro ao buscar avaliações:', error);
                    setAssessmentCount(0);
                })
                .finally(() => {
                    setLoadingAssessments(false);
                });
        } else {
            setLoadingAssessments(false);
        }
    }, [userId]);

    const skillsCount = profile.skills?.length ?? 0;
    const coursesCount = profile.courses?.length ?? 0;
    const hasLocation = profile.home_address !== null &&
        profile.home_address.latitude !== undefined &&
        profile.home_address.longitude !== undefined;

    // Verifica se o perfil está completo para aparecer no ranking
    const isProfileComplete = skillsCount > 0 && hasLocation;

    if (loadingAssessments) {
        return null;
    }

    return (
        <div className="mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-[#5f9ea0]/10 to-[#5f9ea0]/5 rounded-lg border border-[#5f9ea0]/20 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-[#5f9ea0]" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-[#111] uppercase tracking-wide">
                        Ranking
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {/* Alerta de Perfil Incompleto */}
                    {!isProfileComplete && (
                        <div className="bg-gradient-to-br from-[#5f9ea0]/10 to-[#5f9ea0]/5 rounded-lg border-l-[3px] border-[#5f9ea0] p-4 sm:p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#5f9ea0]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm sm:text-base font-semibold text-[#111] mb-2">
                                        Perfil Incompleto
                                    </p>
                                    <p className="text-xs sm:text-sm text-[#111]/70 leading-relaxed">
                                        Para aparecer no ranking e ser visto pelos contratantes, você precisa preencher{' '}
                                        {skillsCount === 0 && !hasLocation && (
                                            <>suas habilidades técnicas e adicionar sua localização.</>
                                        )}
                                        {skillsCount === 0 && hasLocation && (
                                            <>suas habilidades técnicas.</>
                                        )}
                                        {skillsCount > 0 && !hasLocation && (
                                            <>sua localização no perfil.</>
                                        )}
                                    </p>
                                    <a
                                        href="/applicant/profile"
                                        className="inline-block mt-3 text-xs sm:text-sm text-[#5f9ea0] hover:text-[#5f9ea0]/80 font-medium underline"
                                    >
                                        Completar perfil agora →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posição no Ranking - Mostra apenas se perfil estiver completo */}
                    {userRanking && isProfileComplete && (
                        <div className="bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 rounded-lg border-l-[3px] border-[#5f9ea0] p-3 sm:p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs text-[#5f9ea0] mb-1 font-medium uppercase tracking-wide">
                                        Sua Posição
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-bold text-[#111]">
                                            #{userRanking.rank}
                                        </span>
                                        <span className="text-xs sm:text-sm text-[#111]/60">
                                            no ranking
                                        </span>
                                    </div>
                                    {!loading && (
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <TrendingUp className="w-3 h-3 text-[#5f9ea0]" />
                                            <span className="text-xs text-[#111]/70">
                                                Score: {userRanking.finalScore.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#5f9ea0]/30 to-[#5f9ea0]/20 flex items-center justify-center flex-shrink-0">
                                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#5f9ea0]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Habilidades Diferenciais - Destaque Principal */}
                    <div className="bg-white rounded-lg border-l-[3px] border-[#5f9ea0] p-3 sm:p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs text-[#5f9ea0] mb-1 font-medium uppercase tracking-wide">
                                    Habilidades Diferenciais
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-bold text-[#111]">
                                        {assessmentCount}
                                    </span>
                                    <span className="text-xs sm:text-sm text-[#111]/60">
                                        {assessmentCount === 1 ? 'avaliação' : 'avaliações'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center flex-shrink-0">
                                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#5f9ea0]" />
                            </div>
                        </div>
                    </div>

                    {/* Habilidades e Cursos em uma linha no mobile, lado a lado no desktop */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {/* Habilidades */}
                        <div className="bg-white rounded-lg border-l-[3px] border-[#5f9ea0]/50 p-3 sm:p-4 shadow-sm">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-[#5f9ea0] font-medium uppercase tracking-wide">
                                    Habilidades
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl sm:text-2xl font-bold text-[#111]">
                                        {skillsCount}
                                    </span>
                                    <span className="text-xs text-[#111]/60">
                                        {skillsCount === 1 ? 'item' : 'itens'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cursos */}
                        <div className="bg-white rounded-lg border-l-[3px] border-[#5f9ea0]/50 p-3 sm:p-4 shadow-sm">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-[#5f9ea0] font-medium uppercase tracking-wide">
                                    Cursos
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-xl sm:text-2xl font-bold text-[#111]">
                                        {coursesCount}
                                    </span>
                                    <span className="text-xs text-[#111]/60">
                                        {coursesCount === 1 ? 'curso' : 'cursos'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

