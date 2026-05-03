"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, GraduationCap, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfileFormData } from "../ProfileFormSteps";
import {
    EDUCATION_COURSES,
    getCourseDisplayName,
    toCourseStorageValue,
} from "@/lib/constants/education_courses";

interface ExperienceStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
    onManualSaveLongTextField: (
        field: "academic_background",
        value: string
    ) => Promise<boolean>;
}

const COURSE_SUGGESTIONS = Array.from(
    new Set(Object.values(EDUCATION_COURSES).flat())
);

const findSuggestionMatch = (value: string, suggestions: string[]) => {
    const normalizedValue = value.trim().toLocaleLowerCase();
    return suggestions.find((item) => item.toLocaleLowerCase() === normalizedValue);
};

const getFilteredSuggestions = (value: string, suggestions: string[], selectedItems: string[]) => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) return [];

    return suggestions
        .filter((item) => {
            const normalizedItem = item.toLocaleLowerCase();
            return normalizedItem.includes(query) && !selectedItems.includes(item);
        })
        .slice(0, 8);
};

export function ExperienceStep({
    formData,
    updateFormField,
    onManualSaveLongTextField,
}: ExperienceStepProps) {
    const [showCoursesHelp, setShowCoursesHelp] = useState(false);
    const [customCurso, setCustomCurso] = useState("");
    const [academicBackgroundDraft, setAcademicBackgroundDraft] = useState(
        formData.academic_background || ""
    );
    const [academicBackgroundDirty, setAcademicBackgroundDirty] = useState(false);
    const [isSavingAcademicBackground, setIsSavingAcademicBackground] = useState(false);
    const courses = formData.courses || [];

    const adicionarCurso = (courseName: string) => {
        const value = toCourseStorageValue(courseName);
        if (!courses.includes(value)) {
            updateFormField("courses", [...courses, value]);
        }
    };

    const removerCurso = (index: number) => {
        updateFormField("courses", courses.filter((_, i) => i !== index));
    };

    const adicionarCursoCustom = () => {
        const valor = customCurso.trim();
        if (!valor) return;
        const value = toCourseStorageValue(valor);
        if (!courses.includes(value)) {
            updateFormField("courses", [...courses, value]);
            setCustomCurso("");
        }
    };

    const handleCursoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            adicionarCursoCustom();
        }
    };

    const handleCursoInputChange = (value: string) => {
        setCustomCurso(value);
        const suggestionMatch = findSuggestionMatch(value, COURSE_SUGGESTIONS);
        if (suggestionMatch && !courses.includes(toCourseStorageValue(suggestionMatch))) {
            adicionarCurso(suggestionMatch);
            setCustomCurso("");
        }
    };

    const selectedCourseNames = courses.map(getCourseDisplayName);
    const courseSuggestions = getFilteredSuggestions(customCurso, COURSE_SUGGESTIONS, selectedCourseNames);

    useEffect(() => {
        setAcademicBackgroundDraft(formData.academic_background || "");
        setAcademicBackgroundDirty(false);
    }, [formData.academic_background]);

    const salvarFormacaoAcademica = async () => {
        const value = academicBackgroundDraft;
        updateFormField("academic_background", value);
        setIsSavingAcademicBackground(true);
        await onManualSaveLongTextField("academic_background", value);
        setIsSavingAcademicBackground(false);
        setAcademicBackgroundDirty(false);
    };

    return (
        <>
            <Card className="p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#5e9ea0]" />
                    <span>
                        Formação Acadêmica <span className="text-red-500">*</span>
                    </span>
                </h2>

                <textarea
                    placeholder="Ex: Administração - FGV (2008-2012)&#10;MBA em Finanças - IBMEC (2014-2015)"
                    className="text-gray-700 flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-1"
                    value={academicBackgroundDraft}
                    onChange={(e) => {
                        setAcademicBackgroundDraft(e.target.value);
                        setAcademicBackgroundDirty(true);
                    }}
                />
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={salvarFormacaoAcademica}
                        disabled={isSavingAcademicBackground || !academicBackgroundDirty}
                        className="px-4 py-2 bg-[#5f9ea0] text-white rounded-md hover:bg-[#4a8b8f] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSavingAcademicBackground ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </Card>

            <Card className="p-4 sm:p-6 shadow-lg mt-4">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#5f9ea0]" />
                    <span>
                        Cursos <span className="text-red-500">*</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setShowCoursesHelp((prev) => !prev)}
                        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#5f9ea0]/40 text-xs font-bold text-[#2f6668] hover:bg-[#5f9ea0]/10 transition-colors"
                        aria-label="Ajuda sobre Cursos"
                        title="Ajuda"
                    >
                        ?
                    </button>
                </h2>
                {showCoursesHelp && (
                    <div className="mb-4 rounded-md border border-[#5f9ea0]/30 bg-[#5f9ea0]/10 p-3">
                        <p className="text-sm font-semibold text-[#1f4f51]">O que eu aprendi</p>
                        <p className="mt-1 text-sm text-[#334155] leading-relaxed">
                            Hora de listar sua bagagem! Coloque aqui seus cursos, graduações e certificados.
                            Todos eles ajudam você a ser selecionado. E para quem quer um fôlego extra: os
                            cursos dos nossos parceiros no marketplace já somam pontos direto no seu ranking,
                            dando aquele upgrade automático no seu perfil!
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {courses.map((courseEntry, index) => (
                            <Badge
                                key={courseEntry}
                                variant="outline"
                                className="border-[#5f9ea0]/30 text-[#111] bg-[#5f9ea0]/10 text-sm py-1 px-3 flex items-center gap-2"
                            >
                                {getCourseDisplayName(courseEntry)}
                                <button
                                    type="button"
                                    onClick={() => removerCurso(index)}
                                    className="ml-1 hover:text-[#5f9ea0] transition-colors"
                                    aria-label={`Remover ${getCourseDisplayName(courseEntry)}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Digite ou selecione um curso..."
                            value={customCurso}
                            onChange={(e) => handleCursoInputChange(e.target.value)}
                            onKeyPress={handleCursoKeyPress}
                            className="flex-1"
                        />
                        <button
                            type="button"
                            onClick={adicionarCursoCustom}
                            disabled={!customCurso.trim() || courses.includes(toCourseStorageValue(customCurso.trim()))}
                            className="px-4 py-2 bg-[#5f9ea0] text-white rounded-md hover:bg-[#4a8b8f] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Adicionar</span>
                        </button>
                    </div>

                    {courseSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {courseSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => {
                                        adicionarCurso(suggestion);
                                        setCustomCurso("");
                                    }}
                                    className="rounded-full border border-[#5f9ea0]/30 bg-[#5f9ea0]/10 px-3 py-1 text-sm text-[#1f4f51] transition-colors hover:bg-[#5f9ea0]/20"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
}
