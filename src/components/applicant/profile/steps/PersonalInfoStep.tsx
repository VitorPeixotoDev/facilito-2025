"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Calendar, Mail, FileText } from "lucide-react";
import type { ProfileFormData } from "../ProfileFormSteps";

interface PersonalInfoStepProps {
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
}

export function PersonalInfoStep({ formData, updateFormField }: PersonalInfoStepProps) {
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
                        value={formData.birth_date || ""}
                        onChange={(e) => updateFormField("birth_date", e.target.value)}
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
                        value={formData.description || ""}
                        onChange={(e) => updateFormField("description", e.target.value)}
                    />
                    <p className="text-xs text-slate-500 mt-1">Mínimo de 20 caracteres</p>
                </div>
            </div>
        </Card>
    );
}
