"use client";

import { useState, useEffect } from 'react';
import { getUserAssessments, getPredominantAnalysisForAssessment, type UserAssessment } from '@/lib/assessment/userAssessmentsService';
import type { AssessmentConfig } from '@/types/assessments';
import { getGraduationsInfo } from '@/lib/constants/graduations';
import { getCourseDisplayName } from '@/lib/constants/education_courses';
import GraduationModal from './GraduationModal';

interface SkillsAndCoursesSectionProps {
    skills: string[];
    courses: string[];
    profileAnalysis: string[];
    authorizedCompetencies?: string[];
    graduations?: string[];
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
    graduations = [],
    userId,
    onAssessmentClick,
}: SkillsAndCoursesSectionProps) {
    const hasSkills = skills && skills.length > 0;
    const hasCourses = courses && courses.length > 0;
    const hasAuthorizedCompetencies = authorizedCompetencies && authorizedCompetencies.length > 0;
    const hasGraduations = graduations && graduations.length > 0;
    const [assessmentItems, setAssessmentItems] = useState<AssessmentDisplayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGraduation, setSelectedGraduation] = useState<string | null>(null);
    const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);

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
                            assessment.assessmentConfig.id
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

    const graduationsInfo = hasGraduations ? getGraduationsInfo(graduations) : [];

    const handleGraduationClick = (graduationKey: string) => {
        setSelectedGraduation(graduationKey);
        setIsGraduationModalOpen(true);
    };

    const handleCloseGraduationModal = () => {
        setIsGraduationModalOpen(false);
        setSelectedGraduation(null);
    };

    if (!hasSkills && !hasCourses && !hasAuthorizedCompetencies && !hasGraduations && assessmentItems.length === 0 && !loading) {
        return null;
    }

    const sectionTitleClass = 'mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f787a]';
    const chipClass = 'inline-flex items-center rounded-full border border-[#5f9ea0]/25 bg-[#5f9ea0]/10 px-3 py-1.5 text-xs font-medium text-[#1f2b2c] sm:text-sm';

    return (
        <section className="space-y-5">
            {assessmentItems.length > 0 && (
                <div className="rounded-2xl border border-[#dbe8e8] bg-gradient-to-br from-[#f9fcfc] to-[#f4f9f9] p-3.5 sm:p-4">
                    <p className={sectionTitleClass}>Habilidades Diferencias - Avaliadas</p>
                    <div className="flex flex-wrap items-start gap-3">
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
                                    className={`rounded-xl border border-[#d7e5e6] bg-white px-2.5 py-2 shadow-sm ${isClickable ? 'cursor-pointer transition-colors hover:bg-[#f7fbfb]' : ''}`}
                                    onClick={isClickable ? handleClick : undefined}
                                >
                                    <div className="flex flex-col items-center gap-1.5">
                                        {item.assessment.assessmentConfig.image && (
                                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#5f9ea0]/20 bg-white ${isClickable ? 'transition-colors hover:border-[#5f9ea0]' : ''}`}>
                                                <img
                                                    src={item.assessment.assessmentConfig.image}
                                                    alt={item.assessment.assessmentConfig.name}
                                                    className="h-full w-full object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {item.assessment.assessmentConfig?.name && (
                                            <span className={`${chipClass} ${isClickable ? 'transition-colors hover:bg-[#5f9ea0]/20' : ''}`}>
                                                {item.assessment.assessmentConfig.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {hasAuthorizedCompetencies && (
                <div className="rounded-2xl border border-[#dbe8e8] bg-[#fbfdfd] p-3.5 sm:p-4">
                    <p className={sectionTitleClass}>Competências Autorizadas</p>
                    <div className="flex flex-wrap gap-2.5">
                        {authorizedCompetencies.map((competency, index) => (
                            <span
                                key={index}
                                className={chipClass}
                            >
                                {competency}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasSkills && (
                <div className="rounded-2xl border border-[#dbe8e8] bg-[#fbfdfd] p-3.5 sm:p-4">
                    <p className={sectionTitleClass}>Especialidades</p>
                    <div className="flex flex-wrap gap-2.5">
                        {skills.map((skill, index) => (
                            <span
                                key={index}
                                className={chipClass}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasCourses && (
                <div className="rounded-2xl border border-[#dbe8e8] bg-[#fbfdfd] p-3.5 sm:p-4">
                    <p className={sectionTitleClass}>Cursos</p>
                    <div className="flex flex-wrap gap-2.5">
                        {courses.map((course, index) => (
                            <span
                                key={index}
                                className={chipClass}
                            >
                                {getCourseDisplayName(course)}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasGraduations && graduationsInfo.length > 0 && (
                <div className="rounded-2xl border border-[#dbe8e8] bg-gradient-to-br from-[#f9fcfc] to-[#f4f9f9] p-3.5 sm:p-4">
                    <p className={sectionTitleClass}>Graduações</p>
                    <div className="grid grid-cols-1 gap-3">
                        {graduationsInfo.map((graduation) => (
                            <div
                                key={graduation.key}
                                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#5f9ea0]/25 hover:shadow-md sm:p-5"
                                onClick={() => handleGraduationClick(graduation.key)}
                            >
                                <div className="flex items-center gap-4 sm:gap-5">
                                    {graduation.imageSrc && (
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#5f9ea0]/20 bg-white transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
                                            <img
                                                src={graduation.imageSrc}
                                                alt={graduation.label}
                                                className="h-full w-full rounded-2xl object-contain p-1.5 sm:p-2"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-base font-bold leading-tight text-slate-900 sm:text-lg">
                                            {graduation.label}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                            Desenvolvido por
                                        </p>
                                        <p className="text-sm font-semibold text-slate-900 sm:text-base">
                                            {graduation.developer.name}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-[#5f9ea0]">
                                            Toque para ver detalhes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <GraduationModal
                isOpen={isGraduationModalOpen}
                graduationKey={selectedGraduation}
                onClose={handleCloseGraduationModal}
            />
        </section>
    );
}

