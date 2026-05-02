"use client";

import { User, Briefcase, GraduationCap, MapPin, Mail, UserRoundPlus, CheckCircle2, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

export interface OnboardingStep {
    id: number;
    title: string;
    icon: LucideIcon;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
    { id: 1, title: "Informações Pessoais", icon: User },
    { id: 2, title: "Especialidades e Experiências", icon: Briefcase },
    { id: 3, title: "Formação e Cursos", icon: GraduationCap },
    { id: 4, title: "Endereço", icon: MapPin },
    { id: 5, title: "Contato e Redes Sociais", icon: Mail },
    { id: 6, title: "Informações Adicionais", icon: UserRoundPlus },
];

interface ProfileHeaderProps {
    currentStep: number;
    saveStatus: "idle" | "saving" | "saved" | "error";
    onStepClick: (stepId: number) => void;
}

export function ProfileHeader({ currentStep, saveStatus, onStepClick }: ProfileHeaderProps) {
    const progressPercentage = (currentStep / ONBOARDING_STEPS.length) * 100;
    const currentStepData = ONBOARDING_STEPS[currentStep - 1];

    return (
        <>
            <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm pt-2 sm:pt-4 lg:top-20">
                <div className="max-w-6xl mx-auto px-4 py-2 sm:py-3">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                {currentStepData?.title || "Editar Perfil"}
                            </h1>
                            {/* Indicador de salvamento automático */}
                            {saveStatus === "saving" && (
                                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-[#5e9ea0]">
                                    <Skeleton className="h-3 w-3 shrink-0 rounded-full sm:h-4 sm:w-4" aria-hidden />
                                    <span>Salvando automaticamente...</span>
                                </div>
                            )}
                            {saveStatus === "saved" && (
                                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-green-600">
                                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Alterações salvas automaticamente</span>
                                </div>
                            )}
                            {saveStatus === "error" && (
                                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-red-600">
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Erro ao salvar. Tente novamente.</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                            {currentStep} de {ONBOARDING_STEPS.length}
                        </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2 mb-2">
                        <div
                            className="bg-[#5e9ea0] h-1.5 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>

                    {/* Indicadores de etapas */}
                    <div className="grid grid-cols-6 gap-1.5 sm:flex sm:gap-2 mt-2 sm:mt-3 pb-1 sm:pb-2">
                        {ONBOARDING_STEPS.map((step) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => onStepClick(step.id)}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-3 sm:py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer hover:scale-105 active:scale-95 min-h-[60px] sm:min-h-0 w-full sm:w-auto ${isActive
                                        ? "bg-[#5e9ea0] text-white shadow-md"
                                        : isCompleted
                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    <StepIcon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="hidden sm:inline">{step.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

        </>
    );
}

