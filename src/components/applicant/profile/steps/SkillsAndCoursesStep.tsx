"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, BookOpen, X, Plus } from "lucide-react";
import { useState } from "react";
import type { ProfileFormData } from "../ProfileFormSteps";
import { SKILLS_CATEGORIES } from "@/lib/constants/skills_categories";
import {
    EDUCATION_COURSES,
    getCourseDisplayName,
    toCourseStorageValue,
} from "@/lib/constants/education_courses";
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

    // Estados para campos de inserção livre
    const [customHabilidade, setCustomHabilidade] = useState("");
    const [customCurso, setCustomCurso] = useState("");
    const [customServico, setCustomServico] = useState("");

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

    const adicionarCurso = (courseName: string) => {
        const value = toCourseStorageValue(courseName);
        if (!courses.includes(value)) {
            updateFormField("courses", [...courses, value]);
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

    // Funções para adicionar valores customizados
    const adicionarHabilidadeCustom = () => {
        const valor = customHabilidade.trim();
        if (valor && !skills.includes(valor)) {
            adicionarHabilidade(valor);
            setCustomHabilidade("");
        }
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

    const adicionarServicoCustom = () => {
        const valor = customServico.trim();
        if (valor && !freelancerServices.includes(valor)) {
            adicionarServico(valor);
            setCustomServico("");
        }
    };

    // Handlers para Enter nos inputs customizados
    const handleHabilidadeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarHabilidadeCustom();
        }
    };

    const handleCursoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarCursoCustom();
        }
    };

    const handleServicoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarServicoCustom();
        }
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

                    {/* Campo para adicionar habilidade customizada */}
                    <div className="border-t border-slate-200 pt-4">
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Ou adicione uma habilidade personalizada:
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Digite o nome da habilidade..."
                                value={customHabilidade}
                                onChange={(e) => setCustomHabilidade(e.target.value)}
                                onKeyPress={handleHabilidadeKeyPress}
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={adicionarHabilidadeCustom}
                                disabled={!customHabilidade.trim() || skills.includes(customHabilidade.trim())}
                                className="px-4 py-2 bg-[#5f9ea0] text-white rounded-md hover:bg-[#4a8b8f] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Adicionar</span>
                            </button>
                        </div>
                    </div>
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

                    <CategorySearchAutocomplete
                        categories={EDUCATION_COURSES as unknown as Record<string, string[]>}
                        selectedCategory={novaCategoriaCurso}
                        onCategoryChange={setNovaCategoriaCurso}
                        onItemSelect={adicionarCurso}
                        selectedItems={courses.map(getCourseDisplayName)}
                        searchPlaceholder="Buscar curso..."
                        categoryLabel="Escolha de categorias:"
                        categoryIcon={BookOpen}
                    />

                    {/* Campo para adicionar curso customizado */}
                    <div className="border-t border-slate-200 pt-4">
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Ou adicione uma formação personalizada:
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Digite o nome do curso ou formação..."
                                value={customCurso}
                                onChange={(e) => setCustomCurso(e.target.value)}
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
                    </div>
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

                    {/* Campo para adicionar serviço customizado */}
                    <div className="border-t border-slate-200 pt-4">
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">
                            Ou adicione um serviço personalizado:
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Digite o nome do serviço..."
                                value={customServico}
                                onChange={(e) => setCustomServico(e.target.value)}
                                onKeyPress={handleServicoKeyPress}
                                className="flex-1"
                            />
                            <button
                                type="button"
                                onClick={adicionarServicoCustom}
                                disabled={!customServico.trim() || freelancerServices.includes(customServico.trim())}
                                className="px-4 py-2 bg-[#5f9ea0] text-white rounded-md hover:bg-[#4a8b8f] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Adicionar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
}
