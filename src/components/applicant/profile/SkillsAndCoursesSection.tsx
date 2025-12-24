"use client";

import { useState, useEffect } from 'react';
import { getUserAssessments, getPredominantAnalysisForAssessment, type UserAssessment } from '@/lib/assessment/userAssessmentsService';
import type { AssessmentConfig } from '@/types/assessments';

interface SkillsAndCoursesSectionProps {
    skills: string[];
    courses: string[];
    profileAnalysis: string[];
    authorizedCompetencies?: string[];
    userId: string;
    onAssessmentClick?: (assessment: AssessmentConfig) => void;
}

interface AssessmentDisplayItem {
    assessment: UserAssessment;
    predominantTerm: string | null;
}

export default function SkillsAndCoursesSection({
    skills,
    courses,
    profileAnalysis,
    authorizedCompetencies = [],
    userId,
    onAssessmentClick,
}: SkillsAndCoursesSectionProps) {
    const hasSkills = skills && skills.length > 0;
    const hasCourses = courses && courses.length > 0;
    const hasAuthorizedCompetencies = authorizedCompetencies && authorizedCompetencies.length > 0;
    const [assessmentItems, setAssessmentItems] = useState<AssessmentDisplayItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Busca todas as avaliações realizadas e suas análises predominantes
    useEffect(() => {
        if (userId) {
            setLoading(true);
            getUserAssessments(userId)
                .then(async (assessments) => {
                    const items: AssessmentDisplayItem[] = [];
                    for (const assessment of assessments) {
                        const predominantTerm = await getPredominantAnalysisForAssessment(
                            userId,
                            assessment.assessmentId
                        );
                        items.push({
                            assessment,
                            predominantTerm,
                        });
                    }
                    setAssessmentItems(items);
                })
                .catch((error) => {
                    console.error('Erro ao buscar avaliações:', error);
                    setAssessmentItems([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setAssessmentItems([]);
            setLoading(false);
        }
    }, [userId]);

    if (!hasSkills && !hasCourses && !hasAuthorizedCompetencies && assessmentItems.length === 0 && !loading) {
        return null;
    }

    return (
        <section className="space-y-4">
            {assessmentItems.length > 0 && (
                <div>
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">Habilidades Diferencias - Avaliadas</p>
                    <div className="flex flex-wrap items-start gap-4">
                        {assessmentItems.map((item, index) => {
                            const isClickable = item.assessment.assessmentConfig && onAssessmentClick;
                            const handleClick = () => {
                                if (isClickable) {
                                    onAssessmentClick!(item.assessment.assessmentConfig);
                                }
                            };

                            return (
                                <div
                                    key={item.assessment.assessmentId}
                                    className={`flex flex-col items-center gap-1 ${isClickable ? 'cursor-pointer' : ''}`}
                                    onClick={isClickable ? handleClick : undefined}
                                >
                                    {item.assessment.assessmentConfig.image && (
                                        <div className={`w-12 h-12 rounded-full border-2 border-[#5f9ea0]/20 flex items-center justify-center overflow-hidden bg-white flex-shrink-0 ${isClickable ? 'hover:border-[#5f9ea0] transition-colors' : ''}`}>
                                            <img
                                                src={item.assessment.assessmentConfig.image}
                                                alt={item.assessment.assessmentConfig.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    {item.assessment.assessmentConfig?.name && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30 ${isClickable ? 'hover:bg-[#5f9ea0]/20 transition-colors' : ''}`}>
                                            {item.assessment.assessmentConfig.name}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {hasAuthorizedCompetencies && (
                <div>
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">Competências Autorizadas</p>
                    <div className="flex flex-wrap gap-2">
                        {authorizedCompetencies.map((competency, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30"
                            >
                                {competency}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasSkills && (
                <div>
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">Habilidades</p>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasCourses && (
                <div>
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">Cursos</p>
                    <div className="flex flex-wrap gap-2">
                        {courses.map((course, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30"
                            >
                                {course}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

