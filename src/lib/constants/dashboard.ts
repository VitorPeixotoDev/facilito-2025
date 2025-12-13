import { Briefcase, GraduationCap } from "lucide-react";

export interface ProfileOption {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: typeof Briefcase;
    colorClasses: {
        border: string;
        borderHover: string;
        borderActive?: string;
        iconBg: string;
        text: string;
        textHover?: string;
    };
    ariaLabel: string;
}

export const PROFILE_OPTIONS: ProfileOption[] = [
    {
        id: "recrutador",
        title: "Contratante / Recrutador",
        description: "Anuncie vagas e encontre os melhores candidatos para sua empresa",
        href: "https://somos.facilitovagas.com",
        icon: Briefcase,
        colorClasses: {
            border: "border-[#5e9ea0]",
            borderHover: "hover:border-[#5e9ea0]",
            borderActive: "active:border-[#4a8b8f]",
            iconBg: "bg-gradient-to-br from-[#5e9ea0] to-[#4a8b8f]",
            text: "text-[#5e9ea0]",
            textHover: "group-hover:text-[#4a8b8f]",
        },
        ariaLabel: "Acessar área de Recrutador",
    },
    {
        id: "candidato",
        title: "Candidato / Estudante",
        description: "Encontre oportunidades e desenvolva sua carreira",
        href: "/applicant",
        icon: GraduationCap,
        colorClasses: {
            border: "border-blue-500",
            borderHover: "hover:border-blue-500",
            borderActive: "active:border-blue-600",
            iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
            text: "text-blue-600",
            textHover: "group-hover:text-blue-700",
        },
        ariaLabel: "Acessar área de Candidato ou Estudante",
    },
];

export const DASHBOARD_CONFIG = {
    logo: {
        src: "/images/lito_contratant.png",
        alt: "Dr. Lito Contratante",
    },
    welcome: {
        title: "Bem-vindo(a) ao",
        subtitle: "Facilitô! Vagas",
        description: "Escolha como deseja acessar a plataforma",
    },
    terms: {
        text: "Ao continuar, você concorda com nossos termos de uso",
    },
} as const;

