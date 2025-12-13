"use client";

import { Card } from "@/components/ui/card";
import { FileText, Baby, Car } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";

const DRIVERS_LICENSE_TYPES = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

interface AdditionalInfoStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
}

export function AdditionalInfoStep({ formData, updateFormField }: AdditionalInfoStepProps) {
    const hasDriversLicense = formData.has_drivers_license || [];

    const toggleCnh = (tipo: string) => {
        const current = hasDriversLicense || [];
        if (current.includes(tipo)) {
            updateFormField("has_drivers_license", current.filter((t) => t !== tipo));
        } else {
            updateFormField("has_drivers_license", [...current, tipo]);
        }
    };

    return (
        <Card className="p-4 sm:p-6 shadow-lg">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5e9ea0]" />
                Informações Adicionais
            </h2>

            <div className="space-y-6">
                <div className="text-gray-700 flex flex-row items-center justify-between rounded-lg border border-slate-300 p-4">
                    <div className="space-y-0.5">
                        <label className="flex items-center gap-2 text-base font-semibold">
                            <Baby className="w-5 h-5 text-[#5e9ea0]" />
                            Tem filhos?
                        </label>
                        <p className="text-sm text-slate-500">
                            Esta informação pode ser útil para oportunidades de trabalho
                        </p>
                    </div>
                    <input
                        type="checkbox"
                        checked={formData.has_children || false}
                        onChange={(e) => updateFormField("has_children", e.target.checked)}
                        className="w-5 h-5 rounded border-slate-300"
                    />
                </div>

                <div>
                    <label className="text-gray-700 flex items-center gap-2 text-base font-semibold mb-3">
                        <Car className="w-5 h-5 text-[#5e9ea0]" />
                        Carteira Nacional de Habilitação (CNH)
                    </label>
                    <p className="text-sm text-slate-500 mb-3">
                        Selecione os tipos de CNH que você possui
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {DRIVERS_LICENSE_TYPES.map((tipo) => (
                            <button
                                key={tipo}
                                type="button"
                                onClick={() => toggleCnh(tipo)}
                                className={`px-4 py-2 rounded-lg border-2 transition-all ${hasDriversLicense.includes(tipo)
                                    ? "bg-[#5e9ea0] text-white border-[#5e9ea0]"
                                    : "bg-white text-slate-700 border-slate-300 hover:border-[#5e9ea0]"
                                    }`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
}
