"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Calendar, Mail, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfileFormData } from "../ProfileFormSteps";
import { getTodayLocalIsoDate } from "../utils";

interface PersonalInfoStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
    onManualSaveLongTextField: (
        field: "description" | "experience" | "academic_background",
        value: string
    ) => Promise<boolean>;
}

export function PersonalInfoStep({
    formData,
    updateFormField,
    onManualSaveLongTextField,
}: PersonalInfoStepProps) {
    const maxBirthDate = getTodayLocalIsoDate();
    const [descriptionDraft, setDescriptionDraft] = useState(formData.description || "");
    const [descriptionDirty, setDescriptionDirty] = useState(false);
    const [isSavingDescription, setIsSavingDescription] = useState(false);

    useEffect(() => {
        setDescriptionDraft(formData.description || "");
        setDescriptionDirty(false);
    }, [formData.description]);

    const salvarDescricao = async () => {
        const value = descriptionDraft;
        updateFormField("description", value);
        setIsSavingDescription(true);
        await onManualSaveLongTextField("description", value);
        setIsSavingDescription(false);
        setDescriptionDirty(false);
    };

    return (
        <Card className="p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#5e9ea0]" />
                Informações Pessoais
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <User className="w-4 h-4 text-[#5e9ea0]" />
                        <span>
                            Nome Completo <span className="text-red-500">*</span>
                        </span>
                    </label>
                    <Input
                        placeholder="Seu nome completo"
                        value={formData.full_name}
                        onChange={(e) => updateFormField("full_name", e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Mail className="w-4 h-4 text-[#5e9ea0]" />
                        <span>
                            Email <span className="text-red-500">*</span>
                        </span>
                    </label>
                    <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormField("email", e.target.value)}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 text-[#5e9ea0]" />
                        <span>
                            Data de Nascimento <span className="text-red-500">*</span>
                        </span>
                    </label>
                    <Input
                        type="date"
                        max={maxBirthDate}
                        value={formData.birth_date || ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v && v > maxBirthDate) {
                                updateFormField("birth_date", maxBirthDate);
                            } else {
                                updateFormField("birth_date", v);
                            }
                        }}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                        <FileText className="w-4 h-4 text-[#5e9ea0]" />
                        Sobre Mim
                    </label>
                    <textarea
                        placeholder="Descreva sua experiência profissional, conquistas e objetivos..."
                        className="text-gray-700 flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-1"
                        value={descriptionDraft}
                        onChange={(e) => {
                            setDescriptionDraft(e.target.value);
                            setDescriptionDirty(true);
                        }}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={salvarDescricao}
                            disabled={isSavingDescription || !descriptionDirty}
                            className="px-4 py-2 bg-[#5f9ea0] text-white rounded-md hover:bg-[#4a8b8f] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSavingDescription ? "Salvando..." : "Salvar"}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Mínimo de 20 caracteres</p>
                </div>
            </div>
        </Card>
    );
}
