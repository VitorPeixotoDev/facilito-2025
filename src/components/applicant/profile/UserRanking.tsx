"use client";

import { Trophy, Award, TrendingUp, AlertCircle, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/components/AuthClientProvider';
import type { CandidateRankingResult } from '@/lib/ranking/types';

interface UserRankingProps {
    profile: UserProfile | null;
    userRanking?: CandidateRankingResult | null;
    loading?: boolean;
}

export default function UserRanking({ profile, userRanking, loading = false }: UserRankingProps) {
    // Proteção: Se não há profile, não renderizar nada
    if (!profile) {
        return null;
    }

    /** Mesma fonte que a seção "Avaliações Realizadas": `users.certifications` */
    const certificationsCount = profile.certifications?.length ?? 0;

    // Função para obter as classes de cor baseadas na posição do ranking
    const getRankingColors = (rank: number) => {
        if (rank === 1) {
            // Ouro - 1º lugar
            return {
                bgGradient: 'from-[#FFD700]/20 to-[#FFA500]/10',
                border: 'border-[#FFD700]',
                text: 'text-[#7d6a01]',
                iconBg: 'from-[#FFD700]/30 to-[#FFA500]/20',
                iconColor: 'text-[#7d6a01]',
                trendingIcon: 'text-[#7d6a01]',
            };
        } else if (rank === 2) {
            // Prata - 2º lugar
            return {
                bgGradient: 'from-[#C0C0C0]/20 to-[#A8A8A8]/10',
                border: 'border-[#C0C0C0]',
                text: 'text-[#808080]',
                iconBg: 'from-[#C0C0C0]/30 to-[#A8A8A8]/20',
                iconColor: 'text-[#808080]',
                trendingIcon: 'text-[#808080]',
            };
        } else if (rank === 3) {
            // Bronze - 3º lugar
            return {
                bgGradient: 'from-[#CD7F32]/20 to-[#B87333]/10',
                border: 'border-[#CD7F32]',
                text: 'text-[#B87333]',
                iconBg: 'from-[#CD7F32]/30 to-[#B87333]/20',
                iconColor: 'text-[#B87333]',
                trendingIcon: 'text-[#B87333]',
            };
        } else {
            // Cores padrão da aplicação - 4º lugar em diante
            return {
                bgGradient: 'from-[#5f9ea0]/20 to-[#5f9ea0]/10',
                border: 'border-[#5f9ea0]',
                text: 'text-[#5f9ea0]',
                iconBg: 'from-[#5f9ea0]/30 to-[#5f9ea0]/20',
                iconColor: 'text-[#5f9ea0]',
                trendingIcon: 'text-[#5f9ea0]',
            };
        }
    };

    const skillsCount = profile.skills?.length ?? 0;
    const coursesCount = profile.courses?.length ?? 0;
    const hasLocation = profile.home_address !== null &&
        profile.home_address.latitude !== undefined &&
        profile.home_address.longitude !== undefined;

    // Verifica se o perfil está completo para aparecer no ranking
    const isProfileComplete = skillsCount > 0 && hasLocation;

    // Obtém as cores baseadas na posição do ranking
    const rankingColors = userRanking && isProfileComplete
        ? getRankingColors(userRanking.rank)
        : null;

    return (
        <div className="mb-5 sm:mb-6">
            <div className="rounded-[1.75rem] border border-[#c6d7d8] bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] p-4 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10">
                        <Trophy className="h-5 w-5 text-[#5f9ea0]" />
                    </div>
                    <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#365d5f] sm:text-base">
                        Ranking
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {/* Alerta de Perfil Incompleto */}
                    {!isProfileComplete && (
                        <div className="rounded-2xl border border-[#5f9ea0]/20 bg-gradient-to-br from-[#e9f3f3] to-white p-4 shadow-sm sm:p-5">
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/25 to-[#5f9ea0]/10 sm:h-12 sm:w-12">
                                    <AlertCircle className="h-5 w-5 text-[#5f9ea0] sm:h-6 sm:w-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="mb-2 text-sm font-semibold text-[#111] sm:text-base">
                                        Perfil Incompleto
                                    </p>
                                    <p className="text-xs leading-relaxed text-[#111]/70 sm:text-sm">
                                        Para aparecer no ranking e ser visto pelos contratantes, você precisa preencher{' '}
                                        {skillsCount === 0 && !hasLocation && (
                                            <>suas especialidades e adicionar sua localização.</>
                                        )}
                                        {skillsCount === 0 && hasLocation && (
                                            <>suas especialidades.</>
                                        )}
                                        {skillsCount > 0 && !hasLocation && (
                                            <>sua localização no perfil.</>
                                        )}
                                    </p>
                                    <a
                                        href="/applicant/profile"
                                        className="mt-3 inline-block text-xs font-semibold text-[#3f787a] underline decoration-[#3f787a]/40 underline-offset-2 transition-colors hover:text-[#2d595b] sm:text-sm"
                                    >
                                        Completar perfil agora →
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder enquanto o ranking é calculado */}
                    {loading && isProfileComplete && !userRanking && (
                        <div className="rounded-2xl border border-[#5f9ea0]/20 bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] p-4 shadow-sm sm:p-5">
                            <Skeleton className="mb-2 h-3 w-28 rounded" />
                            <Skeleton className="h-9 w-24 rounded-lg sm:h-10 sm:w-28" />
                            <Skeleton className="mt-3 h-3 w-36 rounded" />
                        </div>
                    )}

                    {/* Posição no Ranking - Mostra apenas se perfil estiver completo */}
                    {userRanking && isProfileComplete && rankingColors && (
                        <div className={`rounded-2xl border ${rankingColors.border} bg-gradient-to-br ${rankingColors.bgGradient} p-4 shadow-sm sm:p-5`}>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${rankingColors.text}`}>
                                        Sua Posição
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">
                                            #{userRanking.rank}
                                        </span>
                                        <span className="text-xs text-[#111]/60 sm:text-sm">
                                            no ranking
                                        </span>
                                    </div>
                                    {!loading && (
                                        <div className="mt-2.5 flex items-center gap-1.5">
                                            <TrendingUp className={`h-3.5 w-3.5 ${rankingColors.trendingIcon}`} />
                                            <span className="text-xs font-medium text-[#111]/70">
                                                Score: {userRanking.finalScore.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${rankingColors.iconBg} sm:h-12 sm:w-12`}>
                                    <Trophy className={`h-5 w-5 sm:h-6 sm:w-6 ${rankingColors.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Habilidades Diferenciais - Destaque Principal (ancorado em #avaliacoes-realizadas) */}
                    <div className="rounded-2xl border border-[#d6e3e4] bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f9ea0]">
                                    Habilidades Diferenciais
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold tracking-tight text-[#111] sm:text-4xl">
                                        {certificationsCount}
                                    </span>
                                    <span className="text-xs text-[#111]/60 sm:text-sm">
                                        {certificationsCount === 1 ? 'avaliação' : 'avaliações'}
                                    </span>
                                </div>
                                {/* <p className="mt-2 text-[11px] leading-relaxed text-[#111]/55 sm:text-xs">
                                    Mesmas certificações da seção{' '}
                                    <span className="font-medium text-[#3d7678]">Avaliações Realizadas</span>
                                    {' '}abaixo.
                                </p> */}
                                <a
                                    href="#avaliacoes-realizadas"
                                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3f787a] underline decoration-[#3f787a]/35 underline-offset-2 transition-colors hover:text-[#2d595b] hover:decoration-[#2d595b]/50"
                                >
                                    Ir para a lista
                                    <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                                </a>
                            </div>
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 sm:h-12 sm:w-12">
                                <Award className="h-5 w-5 text-[#5f9ea0] sm:h-6 sm:w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Habilidades e Cursos em uma linha no mobile, lado a lado no desktop */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {/* Habilidades */}
                        <div className="rounded-2xl border border-[#d6e3e4] bg-white p-3.5 shadow-sm sm:p-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f9ea0]">
                                    Especialidades
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">
                                        {skillsCount}
                                    </span>
                                    <span className="text-[11px] text-[#111]/60 sm:text-xs">
                                        {skillsCount === 1 ? 'item' : 'itens'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Cursos */}
                        <div className="rounded-2xl border border-[#d6e3e4] bg-white p-3.5 shadow-sm sm:p-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f9ea0]">
                                    Cursos
                                </p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-extrabold tracking-tight text-[#111] sm:text-3xl">
                                        {coursesCount}
                                    </span>
                                    <span className="text-[11px] text-[#111]/60 sm:text-xs">
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

