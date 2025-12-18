'use client';

import { useMemo, useState } from 'react';
import { Search, Info } from 'lucide-react';
import { EDUCATION_COURSES } from '@/lib/constants/education_courses';

type EducationGroupKey = keyof typeof EDUCATION_COURSES;

interface CourseFiltersProps {
    onCourseSelect?: (
        courseName: string,
        meta: {
            groupKey: EducationGroupKey;
            mainTag?: string;
        },
    ) => void;
    onCategorySelect?: (mainTag: string) => void;
}

const MAIN_EDUCATION_TAGS: string[] = [
    'Administração e Negócios',
    'Agricultura, Agropecuária e Agronegócio',
    'Artes, Design e Moda',
    'Ciências Biológicas e Saúde',
    'Ciências Exatas e Tecnologia da Informação',
    'Ciências Humanas e Sociais',
    'Comunicação e Marketing',
    'Direito e Ciências Jurídicas',
    'Educação e Pedagogia',
    'Engenharia e Arquitetura',
    'Gastronomia e Nutrição',
    'Idiomas e Linguística',
    'Indústria e Produção',
    'Meio Ambiente e Sustentabilidade',
    'Saúde e Bem-estar',
    'Serviços e Atendimento',
    'Turismo, Hotelaria e Eventos',
];

export function CourseFilters({ onCourseSelect, onCategorySelect }: CourseFiltersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState<string>('Todas');
    const [selectedCourseWarning, setSelectedCourseWarning] = useState<string | null>(null);

    const allCourses = useMemo(
        () =>
            Object.entries(EDUCATION_COURSES).flatMap(([groupKey, courses]) =>
                courses.map((name) => ({
                    name,
                    groupKey: groupKey as EducationGroupKey,
                })),
            ),
        [],
    );

    const filteredCourses = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return [];

        return allCourses
            .filter((course) => course.name.toLowerCase().includes(term))
            .slice(0, 8);
    }, [allCourses, searchTerm]);

    const handleTagClick = (tag: string) => {
        setSelectedTag(tag);
        setSelectedCourseWarning(null);
        onCategorySelect?.(tag === 'Todas' ? '' : tag);
    };

    const handleCourseClick = (courseName: string, groupKey: EducationGroupKey) => {
        setSelectedCourseWarning(courseName);
        onCourseSelect?.(courseName, {
            groupKey,
            mainTag: selectedTag !== 'Todas' ? selectedTag : undefined,
        });
    };

    return (
        <section
            aria-label="Filtros de cursos e formações"
            className="mb-6 sm:mb-8"
        >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-3.5 py-3 sm:px-4 sm:py-4">
                {/* Campo de busca */}
                <div className="mb-3 sm:mb-4">
                    <label htmlFor="course-search" className="sr-only">
                        Buscar cursos e formações
                    </label>
                    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-2.5">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                        <input
                            id="course-search"
                            type="search"
                            placeholder="Buscar cursos, graduações ou certificações"
                            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedCourseWarning(null);
                            }}
                        />
                    </div>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-slate-500">
                        Ex.: &quot;Administração de Empresas&quot;, &quot;Engenharia de Software&quot;, &quot;Inglês&quot;
                    </p>
                </div>

                {/* Carrossel de categorias principais */}
                <div className="mb-3 sm:mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs sm:text-sm font-medium text-slate-700">
                            Categorias de cursos
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
                            {MAIN_EDUCATION_TAGS.map((tag) => (
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

                    {/* Aviso de indisponibilidade de parceiros */}
                    {selectedTag !== 'Todas' && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5">
                            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
                                No momento, nenhum parceiro disponibilizou graduações específicas em
                                <span className="font-semibold"> {selectedTag}</span>. Estamos trabalhando para trazer
                                formações dessa área para você em breve.
                            </p>
                        </div>
                    )}
                </div>

                {/* Resultados da busca */}
                <div>
                    {searchTerm.trim() ? (
                        filteredCourses.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-xs sm:text-sm text-slate-500">
                                    {filteredCourses.length} curso(s) encontrado(s) nos seus resultados
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {filteredCourses.map((course) => (
                                        <button
                                            key={`${course.groupKey}-${course.name}`}
                                            type="button"
                                            onClick={() => handleCourseClick(course.name, course.groupKey)}
                                            className="inline-flex items-center rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 text-[11px] sm:text-xs text-slate-800 transition-colors"
                                        >
                                            {course.name}
                                        </button>
                                    ))}
                                </div>

                                {selectedCourseWarning && (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 sm:px-4 sm:py-3 flex items-start gap-2.5">
                                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
                                            No momento, nenhum parceiro disponibilizou graduações específicas
                                            relacionadas a
                                            <span className="font-semibold"> {selectedCourseWarning}</span>. Estamos
                                            trabalhando para trazer formações dessa área para você em breve.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs sm:text-sm text-slate-500">
                                Nenhum curso encontrado para &quot;{searchTerm.trim()}&quot;. Tente outro termo.
                            </p>
                        )
                    ) : (
                        <p className="text-xs sm:text-sm text-slate-500">
                            Use a busca para encontrar cursos específicos ou explore pelas categorias acima.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
