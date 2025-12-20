'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ASSESSMENTS_CONFIG } from '@/lib/assessment/assessmentsConfig';
import AssessmentCard from '@/components/assessment/AssessmentCard';
import { getLatestResult } from '@/lib/assessment/resultsStorage';
import { useAuth } from '@/components/AuthClientProvider';
import { MAIN_ASSESSMENT_TAGS, TAG_ASSESSMENTS_MAP } from '@/lib/constants/assessment_tags';

interface AssessmentFiltersProps {
    initialSearchTerm?: string;
}

export function AssessmentFilters({ initialSearchTerm }: AssessmentFiltersProps) {
    const router = useRouter();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm ?? '');
    const [selectedTag, setSelectedTag] = useState<string>('Todas');
    const [selectedTagWarning, setSelectedTagWarning] = useState<string | null>(null);
    const [completedAssessments, setCompletedAssessments] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (initialSearchTerm !== undefined) {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const allAssessments = useMemo(() => ASSESSMENTS_CONFIG, []);

    // Carregar informações de avaliações concluídas
    useEffect(() => {
        const checkCompletedAssessments = async () => {
            const completed = new Set<string>();

            for (const assessment of allAssessments) {
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

        if (allAssessments.length > 0) {
            void checkCompletedAssessments();
        }
    }, [allAssessments, user?.id]);

    const handleStartAssessment = async (assessmentId: string) => {
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

    const handleTagClick = (tag: string) => {
        setSelectedTag(tag);
        setSearchTerm('');

        const mappedIds = TAG_ASSESSMENTS_MAP[tag as keyof typeof TAG_ASSESSMENTS_MAP] ?? [];
        if (tag !== 'Todas' && mappedIds.length === 0) {
            setSelectedTagWarning(tag);
        } else {
            setSelectedTagWarning(null);
        }
    };

    const filteredByTag = useMemo(() => {
        if (selectedTag === 'Todas') return allAssessments;

        const ids = TAG_ASSESSMENTS_MAP[selectedTag as keyof typeof TAG_ASSESSMENTS_MAP] ?? [];
        if (!ids.length) return [];

        return allAssessments.filter((assessment) => ids.includes(assessment.id));
    }, [allAssessments, selectedTag]);

    const filteredAssessments = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const baseList = filteredByTag.length > 0 || selectedTag !== 'Todas' ? filteredByTag : allAssessments;

        if (!term) return baseList;

        return baseList.filter(
            (assessment) =>
                assessment.name.toLowerCase().includes(term) ||
                assessment.description.toLowerCase().includes(term),
        );
    }, [allAssessments, filteredByTag, searchTerm, selectedTag]);

    return (
        <section
            aria-label="Filtros de avaliações"
            className="mb-6 sm:mb-8"
        >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-3.5 py-3 sm:px-4 sm:py-4">
                {/* Campo de busca */}
                <div className="mb-3 sm:mb-4">
                    <label htmlFor="assessment-search" className="sr-only">
                        Buscar avaliações
                    </label>
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-2.5">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                            id="assessment-search"
                            type="search"
                            placeholder="Buscar avaliações por nome ou tipo"
                            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500">
                        Ex.: &quot;Fit Cultural&quot;, &quot;FiveMind&quot;, &quot;HexaMind&quot;
                    </p>
                </div>

                {/* Carrossel de categorias de avaliação */}
                <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-700">
                            Categorias de avaliação
                        </p>
                    </div>
                    <div className="-mx-3.5 sm:-mx-4">
                        <div className="flex gap-2 sm:gap-2.5 px-3.5 sm:px-4 pb-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent snap-x snap-mandatory">
                            <button
                                type="button"
                                onClick={() => handleTagClick('Todas')}
                                className={`snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${selectedTag === 'Todas'
                                    ? 'bg-[#5e9ea0] text-white border-[#5e9ea0]'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                Todas
                            </button>
                            {MAIN_ASSESSMENT_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`snap-start whitespace-nowrap rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${selectedTag === tag
                                        ? 'bg-[#5e9ea0] text-white border-[#5e9ea0]'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aviso de indisponibilidade para tags sem avaliações */}
                    {selectedTagWarning && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
                                No momento, ainda não temos avaliações mapeadas para a categoria
                                <span className="font-semibold"> {selectedTagWarning}</span>. Estamos trabalhando para
                                trazer assessments dessa área para você em breve.
                            </p>
                        </div>
                    )}
                </div>

                {/* Lista de avaliações filtradas */}
                <div>
                    {filteredAssessments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredAssessments.map((assessment) => {
                                const completed = completedAssessments.has(assessment.id);
                                return (
                                    <AssessmentCard
                                        key={assessment.id}
                                        assessment={assessment}
                                        onStart={() => void handleStartAssessment(assessment.id)}
                                        completed={completed}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs sm:text-sm text-slate-500">
                            {selectedTag === 'Todas' && !searchTerm.trim()
                                ? 'Nenhuma avaliação disponível no momento.'
                                : 'Nenhuma avaliação encontrada para os filtros selecionados.'}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
