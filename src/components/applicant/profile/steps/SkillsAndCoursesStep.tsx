"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Briefcase, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfileFormData } from "../ProfileFormSteps";
import { SKILLS_CATEGORIES } from "@/lib/constants/skills_categories";
import { FREELANCER_SERVICES } from "@/lib/constants/freelancer_services";

interface SkillsAndCoursesStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
    onManualSaveLongTextField: (
        field: "experience" | "academic_background",
        value: string
    ) => Promise<boolean>;
}

const SKILL_SUGGESTIONS = Array.from(
    new Set(Object.values(SKILLS_CATEGORIES).flat())
);

const FREELANCER_SUGGESTIONS = Array.from(
    new Set(Object.values(FREELANCER_SERVICES).flat())
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

export function SkillsAndCoursesStep({
    formData,
    updateFormField,
    onManualSaveLongTextField,
}: SkillsAndCoursesStepProps) {
    const [activeHelp, setActiveHelp] = useState<"skills" | "freela" | null>(null);
    const [customHabilidade, setCustomHabilidade] = useState("");
    const [customServico, setCustomServico] = useState("");
    const [experienceDraft, setExperienceDraft] = useState(formData.experience || "");
    const [experienceDirty, setExperienceDirty] = useState(false);
    const [isSavingExperience, setIsSavingExperience] = useState(false);

    const skills = formData.skills || [];
    const freelancerServices = formData.freelancer_services || [];

    const adicionarHabilidade = (habilidade: string) => {
        if (!skills.includes(habilidade)) {
            updateFormField("skills", [...skills, habilidade]);
        }
    };

    const removerHabilidade = (index: number) => {
        updateFormField("skills", skills.filter((_, i) => i !== index));
    };

    const adicionarServico = (servico: string) => {
        if (!freelancerServices.includes(servico)) {
            updateFormField("freelancer_services", [...freelancerServices, servico]);
        }
    };

    const removerServico = (index: number) => {
        updateFormField("freelancer_services", freelancerServices.filter((_, i) => i !== index));
    };

    const adicionarHabilidadeCustom = () => {
        const valor = customHabilidade.trim();
        if (valor && !skills.includes(valor)) {
            adicionarHabilidade(valor);
            setCustomHabilidade("");
        }
    };

    const adicionarServicoCustom = () => {
        const valor = customServico.trim();
        if (valor && !freelancerServices.includes(valor)) {
            adicionarServico(valor);
            setCustomServico("");
        }
    };

    const handleHabilidadeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            adicionarHabilidadeCustom();
        }
    };

    const handleServicoKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            adicionarServicoCustom();
        }
    };

    const handleHabilidadeInputChange = (value: string) => {
        setCustomHabilidade(value);
        const suggestionMatch = findSuggestionMatch(value, SKILL_SUGGESTIONS);
        if (suggestionMatch && !skills.includes(suggestionMatch)) {
            adicionarHabilidade(suggestionMatch);
            setCustomHabilidade("");
        }
    };

    const handleServicoInputChange = (value: string) => {
        setCustomServico(value);
        const suggestionMatch = findSuggestionMatch(value, FREELANCER_SUGGESTIONS);
        if (suggestionMatch && !freelancerServices.includes(suggestionMatch)) {
            adicionarServico(suggestionMatch);
            setCustomServico("");
        }
    };

    const habilidadeSuggestions = getFilteredSuggestions(customHabilidade, SKILL_SUGGESTIONS, skills);
    const servicoSuggestions = getFilteredSuggestions(
        customServico,
        FREELANCER_SUGGESTIONS,
        freelancerServices
    );

    useEffect(() => {
        setExperienceDraft(formData.experience || "");
        setExperienceDirty(false);
    }, [formData.experience]);

    const salvarExperiencia = async () => {
        const value = experienceDraft;
        updateFormField("experience", value);
        setIsSavingExperience(true);
        await onManualSaveLongTextField("experience", value);
        setIsSavingExperience(false);
        setExperienceDirty(false);
    };

    const helpContent = {
        skills: {
            title: "O que eu domino",
            body: `Aqui é o espaço para você brilhar! Escreva as atividades que você realmente domina e está pronto para exercer. Vale colocar "Vendas", "Gestão de Estoque", "Desenvolvimento Next.js" ou qualquer coisa que seja o seu ponto forte. É o que vai te fazer entrar no nosso ranking!`,
        },
        freela: {
            title: 'O "corre" do dia a dia',
            body: `Precisa de uma renda extra enquanto a vaga ideal não chega? Liste aqui serviços que você aceita fazer de forma autônoma. Vale tudo: desde "Garçom" e "Eventos" até "Tradução de Textos" ou "Manutenção de Computadores". Quem sabe o seu próximo money não aparece por aqui hoje mesmo?`,
        },
    } as const;

    return (
        <>
            {/* Habilidades */}
            <Card className="p-4 sm:p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5f9ea0]" />
                    <span>
                        Especialidades <span className="text-red-500">*</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setActiveHelp(activeHelp === "skills" ? null : "skills")}
                        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#5f9ea0]/40 text-xs font-bold text-[#2f6668] hover:bg-[#5f9ea0]/10 transition-colors"
                        aria-label="Ajuda sobre Especialidades"
                        title="Ajuda"
                    >
                        ?
                    </button>
                </h2>
                {activeHelp === "skills" && (
                    <div className="mb-4 rounded-md border border-[#5f9ea0]/30 bg-[#5f9ea0]/10 p-3">
                        <p className="text-sm font-semibold text-[#1f4f51]">{helpContent.skills.title}</p>
                        <p className="mt-1 text-sm text-[#334155] leading-relaxed">{helpContent.skills.body}</p>
                    </div>
                )}

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

                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Digite ou selecione uma especialidade..."
                            value={customHabilidade}
                            onChange={(e) => handleHabilidadeInputChange(e.target.value)}
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

                    {habilidadeSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {habilidadeSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => {
                                        adicionarHabilidade(suggestion);
                                        setCustomHabilidade("");
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

            {/* Experiência Profissional */}
            <Card className="p-4 sm:p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5f9ea0]" />
                    <span>
                        Experiência Profissional <span className="text-red-500">*</span>
                    </span>
                </h2>
                <textarea
                    placeholder="Descreva sua experiência profissional, empresas onde trabalhou, cargos ocupados..."
                    className="text-gray-700 flex min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-1"
                    value={experienceDraft}
                    onChange={(e) => {
                        setExperienceDraft(e.target.value);
                        setExperienceDirty(true);
                    }}
                />
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={salvarExperiencia}
                        disabled={isSavingExperience || !experienceDirty}
                        className="px-4 py-2 bg-[#5f9ea0] text-white rounded-md hover:bg-[#4a8b8f] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSavingExperience ? "Salvando..." : "Salvar"}
                    </button>
                </div>
            </Card>

            {/* Serviços Freelancer */}
            <Card className="p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg font-bold text-[#111] mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5f9ea0]" />
                    <span>
                        Disponível para Freela de: <span className="text-red-500">*</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setActiveHelp(activeHelp === "freela" ? null : "freela")}
                        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#5f9ea0]/40 text-xs font-bold text-[#2f6668] hover:bg-[#5f9ea0]/10 transition-colors"
                        aria-label="Ajuda sobre serviços freelancer"
                        title="Ajuda"
                    >
                        ?
                    </button>
                </h2>
                {activeHelp === "freela" && (
                    <div className="mb-4 rounded-md border border-[#5f9ea0]/30 bg-[#5f9ea0]/10 p-3">
                        <p className="text-sm font-semibold text-[#1f4f51]">{helpContent.freela.title}</p>
                        <p className="mt-1 text-sm text-[#334155] leading-relaxed">{helpContent.freela.body}</p>
                    </div>
                )}

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

                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Digite ou selecione um serviço..."
                            value={customServico}
                            onChange={(e) => handleServicoInputChange(e.target.value)}
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

                    {servicoSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {servicoSuggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => {
                                        adicionarServico(suggestion);
                                        setCustomServico("");
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
