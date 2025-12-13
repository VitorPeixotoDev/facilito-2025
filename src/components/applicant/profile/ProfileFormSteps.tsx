"use client";

import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { SkillsAndCoursesStep } from "./steps/SkillsAndCoursesStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { AddressStep } from "./steps/AddressStep";
import { ContactStep } from "./steps/ContactStep";
import { AdditionalInfoStep } from "./steps/AdditionalInfoStep";

export interface ProfileFormData {
    full_name: string;
    email: string;
    description?: string;
    birth_date?: string;
    skills: string[];
    courses: string[];
    freelancer_services: string[];
    experience?: string;
    academic_background?: string;
    has_children?: boolean;
    has_drivers_license: string[];
    home_address?: {
        latitude: number;
        longitude: number;
        description: string;
    } | null;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    whatsapp?: string;
    contact_email?: string;
    portfolio?: string;
}

interface ProfileFormStepsProps {
    currentStep: number;
    formData: ProfileFormData;
    updateFormField: <K extends keyof ProfileFormData>(
        field: K,
        value: ProfileFormData[K]
    ) => void;
    enderecoManual: string;
    setEnderecoManual: (value: string) => void;
    isLocating: boolean;
    buscandoEndereco: boolean;
    onObterLocalizacao: () => void;
    onBuscarEndereco: () => void;
}

export function ProfileFormSteps({
    currentStep,
    formData,
    updateFormField,
    enderecoManual,
    setEnderecoManual,
    isLocating,
    buscandoEndereco,
    onObterLocalizacao,
    onBuscarEndereco,
}: ProfileFormStepsProps) {
    switch (currentStep) {
        case 1:
            return <PersonalInfoStep formData={formData} updateFormField={updateFormField} />;
        case 2:
            return <SkillsAndCoursesStep formData={formData} updateFormField={updateFormField} />;
        case 3:
            return <ExperienceStep formData={formData} updateFormField={updateFormField} />;
        case 4:
            return (
                <AddressStep
                    formData={formData}
                    updateFormField={updateFormField}
                    enderecoManual={enderecoManual}
                    setEnderecoManual={setEnderecoManual}
                    isLocating={isLocating}
                    buscandoEndereco={buscandoEndereco}
                    onObterLocalizacao={onObterLocalizacao}
                    onBuscarEndereco={onBuscarEndereco}
                />
            );
        case 5:
            return <ContactStep formData={formData} updateFormField={updateFormField} />;
        case 6:
            return <AdditionalInfoStep formData={formData} updateFormField={updateFormField} />;
        default:
            return null;
    }
}

