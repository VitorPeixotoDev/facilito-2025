"use client";

import { useEffect, useState } from 'react';
import { Trophy, Award } from 'lucide-react';
import { getUserAssessments } from '@/lib/assessment/userAssessmentsService';
import type { UserProfile } from '@/components/AuthClientProvider';

interface UserRankingProps {
    profile: UserProfile;
    userId: string;
}

export default function UserRanking({ profile, userId }: UserRankingProps) {
    const [assessmentCount, setAssessmentCount] = useState(0);
    const [loading, setLoading] = useState(true);

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
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [userId]);

    const skillsCount = profile.skills?.length ?? 0;
    const coursesCount = profile.courses?.length ?? 0;

    if (loading) {
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

