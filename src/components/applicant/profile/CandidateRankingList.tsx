"use client";

import { useState } from 'react';
import { Trophy, Award, MapPin, Briefcase, BookOpen, TrendingUp, GraduationCap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { CandidateRankingResult } from '@/lib/ranking/types';
import CandidateRankingRightSide from './CandidateRankingRightSide';
import { extractAssessmentIds } from '@/lib/assessment/profileAnalysisMapper';
import { getAssessmentById } from '@/lib/assessment/assessmentsConfig';
import { getGraduationsInfo } from '@/lib/constants/graduations';
import type { AssessmentConfig } from '@/types/assessments';
import AssessmentInfoModal from './AssessmentInfoModal';
import GraduationModal from './GraduationModal';

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
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentConfig | null>(null);
    const [selectedGraduationKey, setSelectedGraduationKey] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-lg border border-[#5f9ea0]/20 bg-white p-4"
                    >
                        <Skeleton className="mb-2 h-4 w-1/3 rounded" />
                        <Skeleton className="h-6 w-1/2 rounded" />
                    </div>
                ))}
            </div>
        );
    }

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
        <>
            <div className="space-y-3">
                {candidates.map((candidate) => {
                    const assessmentIcons = getCandidateAssessmentIcons(candidate.profileAnalysis);
                    const rankColors = getRankBadgeColors(candidate.rank);
                    const graduationsInfo = candidate.graduations && candidate.graduations.length > 0
                        ? getGraduationsInfo(candidate.graduations)
                        : [];
                    const emblems = [
                        ...assessmentIcons.map(({ id, assessment, imagePath }) => ({
                            key: `assessment-${id}`,
                            name: assessment.name,
                            imageSrc: imagePath ?? assessment.image ?? null,
                            type: 'assessment' as const,
                            assessment,
                        })),
                        ...graduationsInfo.map((graduation) => ({
                            key: `graduation-${graduation.key}`,
                            name: graduation.label,
                            imageSrc: graduation.imageSrc,
                            type: 'graduation' as const,
                            graduationKey: graduation.key,
                        })),
                    ];

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

                                    {emblems.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2.5 mb-2">
                                            {emblems.map((emblem) => (
                                                <button
                                                    key={emblem.key}
                                                    type="button"
                                                    onClick={() => {
                                                        if (emblem.type === 'assessment') {
                                                            setSelectedAssessment(emblem.assessment);
                                                            return;
                                                        }
                                                        setSelectedGraduationKey(emblem.graduationKey);
                                                    }}
                                                    className="group rounded-2xl border border-[#d6e3e4] bg-gradient-to-br from-[#f9fcfc] to-[#f4f9f9] p-2.5 shadow-sm transition-all hover:border-[#5f9ea0]/30 hover:shadow-md"
                                                    title={emblem.name}
                                                >
                                                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#5f9ea0]/20 bg-white">
                                                        {emblem.imageSrc ? (
                                                            <img
                                                                src={emblem.imageSrc}
                                                                alt={emblem.name}
                                                                className="h-full w-full object-contain"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <GraduationCap className="w-5 h-5 text-[#5f9ea0]" />
                                                        )}
                                                    </div>
                                                    <p className="w-full truncate text-center text-xs font-medium text-[#111]/80">
                                                        {emblem.name}
                                                    </p>
                                                </button>
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

            {selectedAssessment && (
                <AssessmentInfoModal
                    isOpen={Boolean(selectedAssessment)}
                    onClose={() => setSelectedAssessment(null)}
                    assessment={selectedAssessment}
                />
            )}

            <GraduationModal
                isOpen={Boolean(selectedGraduationKey)}
                graduationKey={selectedGraduationKey}
                onClose={() => setSelectedGraduationKey(null)}
            />
        </>
    );
}

