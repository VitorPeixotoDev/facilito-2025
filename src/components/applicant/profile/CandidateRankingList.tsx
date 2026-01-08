"use client";

import { Trophy, Award, MapPin, Briefcase, BookOpen, TrendingUp, GraduationCap } from 'lucide-react';
import type { CandidateRankingResult } from '@/lib/ranking/types';
import CandidateRankingRightSide from './CandidateRankingRightSide';
import { extractAssessmentIds } from '@/lib/assessment/profileAnalysisMapper';
import { getAssessmentById } from '@/lib/assessment/assessmentsConfig';
import { getGraduationsInfo } from '@/lib/constants/graduations';

/**
 * Helper function to get assessment image path by ID
 * Uses explicit mapping to ensure images are always resolved correctly
 */
function getAssessmentImagePath(assessmentId: string): string | null {
    const imageMap: Record<string, string> = {
        'five-mind': '/blue_head_lito.png',
        'hexa-mind': '/orange_head_lito.png',
    };
    return imageMap[assessmentId] || null;
}

/**
 * Helper function to get assessment icons for a candidate
 * 
 * Uses extractAssessmentIds to directly extract assessment IDs from profile_analysis
 * using the prefixes "five_mind_result -> " and "hexa_mind_result -> " that are
 * added by the SQL triggers.
 */
function getCandidateAssessmentIcons(profileAnalysis: string[] | null | undefined) {
    if (!profileAnalysis || profileAnalysis.length === 0) {
        return [];
    }

    try {
        // Extract assessment IDs directly from prefixes
        const assessmentIds = extractAssessmentIds(profileAnalysis);

        return assessmentIds
            .map(id => {
                const assessment = getAssessmentById(id);
                if (!assessment) return null;
                const imagePath = getAssessmentImagePath(id);
                return { id, assessment, imagePath };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    } catch (error) {
        console.error('Erro ao processar avaliações:', error);
        return [];
    }
}

interface CandidateRankingListProps {
    candidates: CandidateRankingResult[];
    loading?: boolean;
}

/**
 * Retorna as classes de cor baseadas na posição do ranking
 */
function getRankBadgeColors(rank: number) {
    if (rank === 1) {
        // Ouro - 1º lugar
        return {
            bgGradient: 'from-[#FFD700]/20 to-[#FFA500]/10',
            border: 'border-[#FFD700]',
            textColor: 'text-[#7d6a01]',
        };
    } else if (rank === 2) {
        // Prata - 2º lugar
        return {
            bgGradient: 'from-[#C0C0C0]/20 to-[#A8A8A8]/10',
            border: 'border-[#C0C0C0]',
            textColor: 'text-[#808080]',
        };
    } else if (rank === 3) {
        // Bronze - 3º lugar
        return {
            bgGradient: 'from-[#CD7F32]/20 to-[#B87333]/10',
            border: 'border-[#CD7F32]',
            textColor: 'text-[#B87333]',
        };
    } else {
        // Cores padrão da aplicação - 4º lugar em diante
        return {
            bgGradient: 'from-[#5f9ea0]/20 to-[#5f9ea0]/10',
            border: 'border-[#5f9ea0]',
            textColor: 'text-[#5f9ea0]',
        };
    }
}

/**
 * Component to display a ranked list of candidates
 * 
 * Shows candidates in order of similarity score, with visual indicators
 * for rank, score, and key highlights.
 */
export default function CandidateRankingList({
    candidates,
    loading = false,
}: CandidateRankingListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-lg border border-[#5f9ea0]/20 p-4 animate-pulse"
                    >
                        <div className="h-4 bg-[#5f9ea0]/10 rounded w-1/3 mb-2"></div>
                        <div className="h-6 bg-[#5f9ea0]/10 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    console.log('=====>', candidates);

    if (candidates.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-[#5f9ea0]/20 p-6 text-center">
                <p className="text-sm text-[#111]/60">
                    Nenhum candidato similar encontrado no momento.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {candidates.map((candidate) => {
                const assessmentIcons = getCandidateAssessmentIcons(candidate.profileAnalysis);
                const rankColors = getRankBadgeColors(candidate.rank);
                const graduationsInfo = candidate.graduations && candidate.graduations.length > 0
                    ? getGraduationsInfo(candidate.graduations)
                    : [];
                return (
                    <div
                        key={candidate.candidateId}
                        className="bg-white rounded-lg border-l-[3px] border-[#5f9ea0] p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between gap-3">
                            {/* Left side: Rank and Name */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`flex items-center justify-center w-8 h-8 border-2 ${rankColors.border} rounded-full bg-gradient-to-br ${rankColors.bgGradient} flex-shrink-0`}>
                                        <span className={`text-xs font-bold ${rankColors.textColor}`}>
                                            #{candidate.rank}
                                        </span>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold text-[#111] truncate">
                                        {candidate.candidateName || 'Candidato'}
                                    </h3>
                                </div>

                                {/* Assessment Icons */}
                                {assessmentIcons.length > 0 && (
                                    <div className="flex items-start gap-4 flex-wrap mb-2">
                                        {assessmentIcons.map(({ id, assessment, imagePath }) => (
                                            <div
                                                key={id}
                                                className="flex flex-col items-center gap-2 min-w-[70px]"
                                            >
                                                <div className="w-14 h-14 rounded-full border-2 border-[#5f9ea0]/20 flex items-center justify-center overflow-hidden bg-white flex-shrink-0 shadow-sm">
                                                    {imagePath ? (
                                                        <img
                                                            src={imagePath}
                                                            alt={assessment.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                                            <span className="text-xs font-bold text-blue-600">
                                                                {assessment.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs text-[#111]/80 text-center font-medium leading-tight">
                                                    {assessment.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Graduations */}
                                {graduationsInfo.length > 0 && (
                                    <div className="flex items-start gap-4 flex-wrap mb-2">
                                        {graduationsInfo.map((graduation) => (
                                            <div
                                                key={graduation.key}
                                                className="flex flex-col items-center gap-2 min-w-[70px]"
                                            >
                                                <div className="w-14 h-14 rounded-full border-2 border-[#5f9ea0]/20 flex items-center justify-center overflow-hidden bg-white flex-shrink-0 shadow-sm">
                                                    {graduation.imageSrc ? (
                                                        <img
                                                            src={graduation.imageSrc}
                                                            alt={graduation.label}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                                            <GraduationCap className="w-6 h-6 text-[#5f9ea0]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 text-xs text-[#111]/80 text-center font-medium leading-tight">
                                                    <GraduationCap className="w-3 h-3 text-[#5f9ea0]" />
                                                    {graduation.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Highlights */}
                                {candidate.similarityHighlights.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {candidate.similarityHighlights.map((highlight, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#5f9ea0]/10 text-xs text-[#111]"
                                            >
                                                {highlight.type === 'services' ? (
                                                    <Briefcase className="w-3 h-3 text-[#5f9ea0]" />
                                                ) : (
                                                    <Award className="w-3 h-3 text-[#5f9ea0]" />
                                                )}
                                                <span>
                                                    {highlight.count} {highlight.type === 'services' ? 'serviços' : 'habilidades'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right side: Score badge, stats, and assessment icons */}
                            <CandidateRankingRightSide candidate={candidate} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

