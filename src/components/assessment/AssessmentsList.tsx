"use client";

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AssessmentCard from './AssessmentCard';
import { getAssessmentsByCategory } from '@/lib/assessment/assessmentsConfig';
import { getLatestResult } from '@/lib/assessment/resultsStorage';
import { useAuth } from '@/components/AuthClientProvider';

interface AssessmentsListProps {
    category?: string;
}

export default function AssessmentsList({ category = 'avaliacoes' }: AssessmentsListProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [completedAssessments, setCompletedAssessments] = useState<Set<string>>(new Set());

    const assessments = useMemo(() => {
        return getAssessmentsByCategory(category);
    }, [category]);

    // Verificar quais avaliações foram completadas
    useEffect(() => {
        const checkCompletedAssessments = async () => {
            const completed = new Set<string>();

            for (const assessment of assessments) {
                try {
                    const latestResult = await getLatestResult(assessment.id, user?.id || null);
                    if (latestResult) {
                        completed.add(assessment.id);
                    }
                } catch (error) {
                    console.error(`Erro ao verificar avaliação ${assessment.id}:`, error);
                }
            }

            setCompletedAssessments(completed);
        };

        if (assessments.length > 0) {
            checkCompletedAssessments();
        }
    }, [assessments, user?.id]);

    const handleStartAssessment = async (assessmentId: string) => {
        // Verificar se já existe resultado
        try {
            const latestResult = await getLatestResult(assessmentId, user?.id || null);
            if (latestResult) {
                router.push(`/applicant/shop/assessment/${assessmentId}?view=results`);
            } else {
                router.push(`/applicant/shop/assessment/${assessmentId}?view=instructions`);
            }
        } catch (error) {
            console.error('Erro ao verificar resultado:', error);
            router.push(`/applicant/shop/assessment/${assessmentId}?view=instructions`);
        }
    };

    // Lista de avaliações
    if (assessments.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600">Nenhuma avaliação disponível nesta categoria.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assessments.map((assessment) => {
                const completed = completedAssessments.has(assessment.id);

                return (
                    <AssessmentCard
                        key={assessment.id}
                        assessment={assessment}
                        onStart={() => handleStartAssessment(assessment.id)}
                        completed={completed}
                    />
                );
            })}
        </div>
    );
}

