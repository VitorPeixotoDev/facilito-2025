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
            if (!user?.id) return; // Só busca se houver usuário autenticado

            const completed = new Set<string>();

            for (const assessment of assessments) {
                try {
                    const latestResult = await getLatestResult(assessment.id, user.id);
                    if (latestResult) {
                        completed.add(assessment.id);
                    }
                } catch (error) {
                    console.error(`Erro ao verificar avaliação ${assessment.id}:`, error);
                }
            }

            setCompletedAssessments(completed);
        };

        if (assessments.length > 0 && user?.id) {
            checkCompletedAssessments();
        }
    }, [assessments, user?.id]);

    const handleStartAssessment = async (assessmentId: string) => {
        // Sempre permite iniciar/refazer a avaliação
        router.push(`/applicant/shop/assessment/${assessmentId}?view=instructions`);
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
                        onViewResults={completed ? () => router.push(`/applicant/shop/assessment/${assessment.id}?view=results`) : undefined}
                        completed={completed}
                    />
                );
            })}
        </div>
    );
}

