"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, BookOpen, X } from "lucide-react";
import { useState } from "react";
import type { ProfileFormData } from "../ProfileFormSteps";
import { SKILLS_CATEGORIES } from "@/lib/constants/skills_categories";
import { EDUCATION_COURSES } from "@/lib/constants/education_courses";
import { FREELANCER_SERVICES } from "@/lib/constants/freelancer_services";
import CategorySearchAutocomplete from "@/components/ui/CategorySearchAutocomplete";

interface SkillsAndCoursesStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
}

export function SkillsAndCoursesStep({ formData, updateFormField }: SkillsAndCoursesStepProps) {
    const [novaCategoriaHabilidade, setNovaCategoriaHabilidade] = useState("");
    const [novaCategoriaCurso, setNovaCategoriaCurso] = useState("");
    const [novaCategoriaServico, setNovaCategoriaServico] = useState("");

    const skills = formData.skills || [];
    const courses = formData.courses || [];
    const freelancerServices = formData.freelancer_services || [];

    const adicionarHabilidade = (habilidade: string) => {
        if (!skills.includes(habilidade)) {
            updateFormField("skills", [...skills, habilidade]);
        }
    };

    const removerHabilidade = (index: number) => {
        updateFormField("skills", skills.filter((_, i) => i !== index));
    };

    const adicionarCurso = (curso: string) => {
        if (!courses.includes(curso)) {
            updateFormField("courses", [...courses, curso]);
        }
    };

    const removerCurso = (index: number) => {
        updateFormField("courses", courses.filter((_, i) => i !== index));
    };

    const adicionarServico = (servico: string) => {
        if (!freelancerServices.includes(servico)) {
            updateFormField("freelancer_services", [...freelancerServices, servico]);
        }
    };

    const removerServico = (index: number) => {
        updateFormField("freelancer_services", freelancerServices.filter((_, i) => i !== index));
    };

    return (
        <>
            {/* Habilidades */}
            <Card className="p-4 sm:p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5f9ea0]" />
                    Habilidades Técnicas
                </h2>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((habilidade, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="border-[#5f9ea0]/30 text-[#111] bg-[#5f9ea0]/10 text-sm py-1 px-3 flex items-center gap-2"
                            >
                                {habilidade}
                                <button
                                    type="button"
                                    onClick={() => removerHabilidade(index)}
                                    className="ml-1 hover:text-[#5f9ea0] transition-colors"
                                    aria-label={`Remover ${habilidade}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <CategorySearchAutocomplete
                        categories={SKILLS_CATEGORIES as unknown as Record<string, string[]>}
                        selectedCategory={novaCategoriaHabilidade}
                        onCategoryChange={setNovaCategoriaHabilidade}
                        onItemSelect={adicionarHabilidade}
                        selectedItems={skills}
                        searchPlaceholder="Buscar habilidade..."
                        categoryLabel="Escolha de categorias:"
                        categoryIcon={Briefcase}
                    />
                </div>
            </Card>

            {/* Cursos */}
            <Card className="p-4 sm:p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#5f9ea0]" />
                    Cursos
                </h2>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {courses.map((curso, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="border-[#5f9ea0]/30 text-[#111] bg-[#5f9ea0]/10 text-sm py-1 px-3 flex items-center gap-2"
                            >
                                {curso}
                                <button
                                    type="button"
                                    onClick={() => removerCurso(index)}
                                    className="ml-1 hover:text-[#5f9ea0] transition-colors"
                                    aria-label={`Remover ${curso}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <CategorySearchAutocomplete
                        categories={EDUCATION_COURSES as unknown as Record<string, string[]>}
                        selectedCategory={novaCategoriaCurso}
                        onCategoryChange={setNovaCategoriaCurso}
                        onItemSelect={adicionarCurso}
                        selectedItems={courses}
                        searchPlaceholder="Buscar curso..."
                        categoryLabel="Escolha de categorias:"
                        categoryIcon={BookOpen}
                    />
                </div>
            </Card>

            {/* Serviços Freelancer */}
            <Card className="p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5f9ea0]" />
                    Serviços Freelancer
                </h2>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {freelancerServices.map((servico, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="border-[#5f9ea0]/30 text-[#111] bg-[#5f9ea0]/10 text-sm py-1 px-3 flex items-center gap-2"
                            >
                                {servico}
                                <button
                                    type="button"
                                    onClick={() => removerServico(index)}
                                    className="ml-1 hover:text-[#5f9ea0] transition-colors"
                                    aria-label={`Remover ${servico}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>

                    <CategorySearchAutocomplete
                        categories={FREELANCER_SERVICES as unknown as Record<string, string[]>}
                        selectedCategory={novaCategoriaServico}
                        onCategoryChange={setNovaCategoriaServico}
                        onItemSelect={adicionarServico}
                        selectedItems={freelancerServices}
                        searchPlaceholder="Buscar serviço..."
                        categoryLabel="Escolha de categorias:"
                        categoryIcon={Briefcase}
                    />
                </div>
            </Card>
        </>
    );
}
