"use client";

import { Card } from "@/components/ui/card";
import { Briefcase, GraduationCap } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";

interface ExperienceStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
}

export function ExperienceStep({ formData, updateFormField }: ExperienceStepProps) {
    return (
        <>
            <Card className="p-4 sm:p-6 shadow-lg mb-4">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#5e9ea0]" />
                    Experiência Profissional
                </h2>

                <textarea
                    placeholder="Descreva sua experiência profissional, empresas onde trabalhou, cargos ocupados..."
                    className="text-gray-700 flex min-h-[150px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-1"
                    value={formData.experience || ""}
                    onChange={(e) => updateFormField("experience", e.target.value)}
                />
            </Card>

            <Card className="p-4 sm:p-6 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#5e9ea0]" />
                    Formação Acadêmica
                </h2>

                <textarea
                    placeholder="Ex: Administração - FGV (2008-2012)&#10;MBA em Finanças - IBMEC (2014-2015)"
                    className="text-gray-700 flex min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5e9ea0] focus:ring-offset-1"
                    value={formData.academic_background || ""}
                    onChange={(e) => updateFormField("academic_background", e.target.value)}
                />
            </Card>
        </>
    );
}
