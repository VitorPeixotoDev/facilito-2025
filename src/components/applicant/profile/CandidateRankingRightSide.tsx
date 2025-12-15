"use client";

import { BookOpen, Award, TrendingUp } from 'lucide-react';
import type { CandidateRankingResult } from '@/lib/ranking/types';

interface CandidateRankingRightSideProps {
    candidate: CandidateRankingResult;
}

/**
 * Component for displaying candidate statistics on the right side of ranking card
 * 
 * Shows:
 * - Score with icon
 * - Number of courses
 * - Number of skills
 */
export default function CandidateRankingRightSide({ candidate }: CandidateRankingRightSideProps) {
    return (
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
            {/* Score with icon */}
            <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#5f9ea0]" />
                <span className="text-xs text-[#111]/70">
                    <span className="font-semibold">{candidate.finalScore.toFixed(1)}</span>
                    <span className="ml-0.5">pts</span>
                </span>
            </div>

            {/* Statistics */}
            <div className="flex flex-col items-end gap-1.5">
                {/* Courses */}
                {candidate.coursesCount !== undefined && candidate.coursesCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#5f9ea0]" />
                        <span className="text-xs text-[#111]/70">
                            {candidate.coursesCount} {candidate.coursesCount === 1 ? 'curso' : 'cursos'}
                        </span>
                    </div>
                )}

                {/* Skills */}
                {candidate.skillsCount !== undefined && candidate.skillsCount > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#5f9ea0]" />
                        <span className="text-xs text-[#111]/70">
                            {candidate.skillsCount} {candidate.skillsCount === 1 ? 'habilidade' : 'habilidades'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

