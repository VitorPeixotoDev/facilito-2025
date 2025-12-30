'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Info } from 'lucide-react';
import { EDUCATION_COURSES } from '@/lib/constants/education_courses';
import { MAIN_EDUCATION_TAGS } from '@/lib/constants/education_tags';

type EducationGroupKey = keyof typeof EDUCATION_COURSES;

interface CourseFiltersProps {
    initialSearchTerm?: string;
    onCourseSelect?: (
        courseName: string,
        meta: {
            groupKey: EducationGroupKey;
            mainTag?: string;
        },
    ) => void;
    onCategorySelect?: (mainTag: string) => void;
}

export function CourseFilters({ initialSearchTerm, onCourseSelect, onCategorySelect }: CourseFiltersProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm ?? '');
    const [selectedTag, setSelectedTag] = useState<string>('Todas');
    const [selectedCourseWarning, setSelectedCourseWarning] = useState<string | null>(null);

    useEffect(() => {
        if (initialSearchTerm !== undefined) {
            setSearchTerm(initialSearchTerm);
            setSelectedCourseWarning(null);
        }
    }, [initialSearchTerm]);

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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 sm:px-5 lg:px-6 py-5 sm:py-5 lg:py-6">
                {/* Campo de busca */}
                <div className="mb-5 sm:mb-6">
                    <label htmlFor="course-search" className="sr-only">
                        Buscar cursos e formações
                    </label>
                    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 sm:px-4 sm:py-3">
                        <Search className="w-5 h-5 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
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
                    <p className="mt-2.5 text-xs sm:text-xs text-slate-500 pl-1">
                        Ex.: &quot;Administração de Empresas&quot;, &quot;Engenharia de Software&quot;, &quot;Inglês&quot;
                    </p>
                </div>

                {/* Carrossel de categorias principais */}
                <div className="mb-5 sm:mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm sm:text-sm font-semibold text-slate-700">
                            Categorias de cursos
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
                            {MAIN_EDUCATION_TAGS.map((tag) => (
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

                    {/* Aviso de indisponibilidade de parceiros */}
                    {selectedTag !== 'Todas' && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:px-4 sm:py-3.5 flex items-start gap-3">
                            <Info className="w-5 h-5 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs sm:text-xs text-amber-900 leading-relaxed">
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
                            <div className="space-y-3">
                                <p className="text-sm sm:text-sm text-slate-600 font-medium">
                                    {filteredCourses.length} curso(s) encontrado(s) nos seus resultados
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {filteredCourses.map((course) => (
                                        <button
                                            key={`${course.groupKey}-${course.name}`}
                                            type="button"
                                            onClick={() => handleCourseClick(course.name, course.groupKey)}
                                            className="inline-flex items-center rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2 text-xs sm:text-xs text-slate-800 transition-colors font-medium"
                                        >
                                            {course.name}
                                        </button>
                                    ))}
                                </div>

                                {selectedCourseWarning && (
                                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 sm:px-4 sm:py-3.5 flex items-start gap-3">
                                        <Info className="w-5 h-5 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs sm:text-xs text-amber-900 leading-relaxed">
                                            No momento, nenhum parceiro disponibilizou graduações específicas
                                            relacionadas a
                                            <span className="font-semibold"> {selectedCourseWarning}</span>. Estamos
                                            trabalhando para trazer formações dessa área para você em breve.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm sm:text-sm text-slate-500 py-2">
                                Nenhum curso encontrado para &quot;{searchTerm.trim()}&quot;. Tente outro termo.
                            </p>
                        )
                    ) : (
                        <p className="text-sm sm:text-sm text-slate-500 py-2">
                            Use a busca para encontrar cursos específicos ou explore pelas categorias acima.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
