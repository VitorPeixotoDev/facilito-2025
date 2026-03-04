'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AssessmentCard from '@/components/assessment/AssessmentCard';
import { getLatestResult } from '@/lib/assessment/resultsStorage';
import { useAuth } from '@/components/AuthClientProvider';
import { MAIN_ASSESSMENT_TAGS, TAG_ASSESSMENTS_MAP } from '@/lib/constants/assessment_tags';
import { PaymentAssessmentModal } from './PaymentAssessmentModal';
import type { AssessmentConfig } from '@/types/assessments';

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
    const [purchasedAssessmentIds, setPurchasedAssessmentIds] = useState<Set<string>>(new Set());
    const [assessmentPrices, setAssessmentPrices] = useState<Record<string, number>>({});
    const [paymentModal, setPaymentModal] = useState<{ open: boolean; assessment: AssessmentConfig | null }>({ open: false, assessment: null });
    const [allAssessments, setAllAssessments] = useState<(AssessmentConfig & { slug?: string })[]>([]);
    const [assessmentsLoading, setAssessmentsLoading] = useState(true);

    useEffect(() => {
        if (initialSearchTerm !== undefined) {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    useEffect(() => {
        setAssessmentsLoading(true);
        fetch('/api/assessments')
            .then((res) => res.ok ? res.json() : { assessments: [] })
            .then((data: { assessments?: Array<{ id: string; slug: string; name: string; image?: string; description: string; estimatedTime: string; questionCount: number; category: string }> }) => {
                const list = data.assessments ?? [];
                setAllAssessments(list.map((a) => ({
                    id: a.id,
                    slug: a.slug,
                    name: a.name,
                    image: a.image,
                    description: a.description,
                    estimatedTime: a.estimatedTime,
                    questionCount: a.questionCount,
                    category: a.category,
                })));
            })
            .catch(() => setAllAssessments([]))
            .finally(() => setAssessmentsLoading(false));
    }, []);

    // Carregar informações de avaliações concluídas
    useEffect(() => {
        const checkCompletedAssessments = async () => {
            if (!user?.id) return; // Só busca se houver usuário autenticado

            const completed = new Set<string>();

            for (const assessment of allAssessments) {
                try {
                    const latestResult = await getLatestResult(assessment.id, user.id, assessment.slug);
                    if (latestResult) {
                        completed.add(assessment.id);
                    }
                } catch (error) {
                    console.error(`Erro ao verificar avaliação ${assessment.id}:`, error);
                }
            }

            setCompletedAssessments(completed);
        };

        if (allAssessments.length > 0 && user?.id) {
            void checkCompletedAssessments();
        }
    }, [allAssessments, user?.id]);

    // Carregar preços das avaliações (vindos do banco)
    useEffect(() => {
        fetch('/api/assessment-prices')
            .then((res) => res.ok ? res.json() : { prices: {} })
            .then((data: { prices?: Record<string, number> }) => {
                setAssessmentPrices(data.prices ?? {});
            })
            .catch(() => setAssessmentPrices({}));
    }, []);

    // Carregar avaliações já compradas (pagas via Stripe)
    useEffect(() => {
        if (!user?.id) return;
        fetch('/api/assessment-purchases')
            .then((res) => res.ok ? res.json() : { assessmentIds: [] })
            .then((data: { assessmentIds?: string[] }) => {
                setPurchasedAssessmentIds(new Set(data.assessmentIds ?? []));
            })
            .catch(() => setPurchasedAssessmentIds(new Set()));
    }, [user?.id]);

    const handleStartAssessment = (assessment: AssessmentConfig) => {
        const hasPurchased = purchasedAssessmentIds.has(assessment.id);
        if (!hasPurchased) {
            setPaymentModal({ open: true, assessment });
            return;
        }
        router.push(`/applicant/shop/assessment/${assessment.id}?view=instructions`);
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 sm:px-5 lg:px-6 py-5 sm:py-5 lg:py-6">
                {/* Campo de busca */}
                <div className="mb-5 sm:mb-6">
                    <label htmlFor="assessment-search" className="sr-only">
                        Buscar avaliações
                    </label>
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 sm:px-4 sm:py-3">
                        <Search className="w-5 h-5 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                        <input
                            id="assessment-search"
                            type="search"
                            placeholder="Buscar avaliações por nome ou tipo"
                            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <p className="mt-2.5 text-xs sm:text-xs text-slate-500 pl-1">
                        Ex.: &quot;Fit Cultural&quot;, &quot;FiveMind&quot;, &quot;HexaMind&quot;
                    </p>
                </div>

                {/* Carrossel de categorias de avaliação */}
                <div className="mb-5 sm:mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm sm:text-sm font-semibold text-slate-700">
                            Categorias de avaliação
                        </p>
                    </div>
                    <div className="-mx-4 sm:-mx-5 lg:-mx-6">
                        <div className="flex gap-2.5 sm:gap-3 px-4 sm:px-5 lg:px-6 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent snap-x snap-mandatory">
                            <button
                                type="button"
                                onClick={() => handleTagClick('Todas')}
                                className={`snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm sm:text-sm font-semibold transition-all ${selectedTag === 'Todas'
                                    ? 'bg-[#5e9ea0] text-white border-[#5e9ea0] shadow-sm'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                Todas
                            </button>
                            {MAIN_ASSESSMENT_TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagClick(tag)}
                                    className={`snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm sm:text-sm font-semibold transition-all ${selectedTag === tag
                                        ? 'bg-[#5e9ea0] text-white border-[#5e9ea0] shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aviso de indisponibilidade para tags sem avaliações */}
                    {selectedTagWarning && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:px-4 sm:py-3.5 flex items-start gap-3">
                            <Info className="w-5 h-5 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs sm:text-xs text-amber-900 leading-relaxed">
                                No momento, ainda não temos avaliações mapeadas para a categoria
                                <span className="font-semibold"> {selectedTagWarning}</span>. Estamos trabalhando para
                                trazer assessments dessa área para você em breve.
                            </p>
                        </div>
                    )}
                </div>

                {/* Lista de avaliações filtradas */}
                <div>
                    {assessmentsLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
                            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-[#5e9ea0]" aria-hidden />
                            <p className="text-sm font-medium text-slate-600">Carregando...</p>
                        </div>
                    ) : filteredAssessments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
                            {filteredAssessments.map((assessment) => {
                                const completed = completedAssessments.has(assessment.id);
                                return (
                                    <AssessmentCard
                                        key={assessment.id}
                                        assessment={assessment}
                                        onStart={() => handleStartAssessment(assessment)}
                                        onViewResults={completed ? () => router.push(`/applicant/shop/assessment/${assessment.id}?view=results`) : undefined}
                                        completed={completed}
                                        purchased={purchasedAssessmentIds.has(assessment.id)}
                                        priceCents={assessmentPrices[assessment.id]}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm sm:text-sm text-slate-500 py-2">
                            {selectedTag === 'Todas' && !searchTerm.trim()
                                ? 'Nenhuma avaliação disponível no momento.'
                                : 'Nenhuma avaliação encontrada para os filtros selecionados.'}
                        </p>
                    )}
                </div>
            </div>

            <PaymentAssessmentModal
                isOpen={paymentModal.open}
                onClose={() => setPaymentModal({ open: false, assessment: null })}
                assessmentName={paymentModal.assessment?.name ?? ''}
                assessmentId={paymentModal.assessment?.id ?? ''}
                priceCents={paymentModal.assessment ? (assessmentPrices[paymentModal.assessment.id] ?? 2000) : 2000}
            />
        </section>
    );
}
