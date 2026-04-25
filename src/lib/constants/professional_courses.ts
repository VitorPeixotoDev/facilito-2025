/**
 * Catálogo central de cursos parceiros para Educação Profissional.
 * Fonte única para renderização de cards, busca e filtros por categoria.
 */

import type { EducationCategoryKey } from '@/lib/constants/education_courses';

/**
 * Tags curtas relacionadas ao curso (ex.: chips no card/modal).
 * Máximo de 5 itens — garantido em tipo.
 */
export type PartnerCourseRelatedTags =
    | readonly []
    | readonly [string]
    | readonly [string, string]
    | readonly [string, string, string]
    | readonly [string, string, string, string]
    | readonly [string, string, string, string, string];

export interface ProfessionalCoursePartner {
    name: string;
    logoSrc: string;
    url?: string;
    /** Até 5 tags relacionadas ao curso (parceiro + tema). */
    tags: PartnerCourseRelatedTags;
}

export interface ProfessionalCourseModule {
    title: string;
    description: string;
}

export interface ProfessionalCourseAudienceItem {
    title: string;
    description: string;
}

export interface ProfessionalCourseDetails {
    modalTitle: string;
    title: string;
    header: string;
    overview: string;
    targetAudience: ProfessionalCourseAudienceItem[];
    developmentTopicsTitle: string;
    modules: ProfessionalCourseModule[];
    differentialsTitle: string;
    differentials: string[];
    careerImpactTitle: string;
    careerImpact: string;
}

export interface ProfessionalCourseConfig {
    id: string;
    slug: string;
    courseName: string;
    shortDescription: string;
    investiment: string;
    ctaUrl: string;
    imageSrc: string;
    estimatedTime: string;
    educationCategoryKey: EducationCategoryKey;
    mainTags: string[];
    partner: ProfessionalCoursePartner;
    details: ProfessionalCourseDetails;
}

export const PROFESSIONAL_COURSES_CONFIG: ProfessionalCourseConfig[] = [
    {
        id: 'course-formacao-lideres-saude',
        slug: 'formacao-lideres-saude',
        courseName: 'Formação de Líderes na Saúde',
        shortDescription: 'Domine a governança, inteligência emocional e eficiência operacional na saúde.',
        investiment: 'R$99',
        ctaUrl: 'https://liderancasaude-pvj2abfr.manus.space/',
        imageSrc: '/partners_logo/bary_logo.png',
        estimatedTime: 'Carga horária variável',
        educationCategoryKey: 'Cursos Livres e Qualificação Profissional',
        mainTags: ['Ciências Biológicas e Saúde', 'Administração e Negócios'],
        partner: {
            name: 'Bary - Consultoria e Treinamento',
            logoSrc: '/partners_logo/bary_logo.png',
            tags: [
                'Liderança',
                'Gestão em saúde',
                'Inteligência emocional',
                'Segurança do paciente',
                'Eficiência operacional',
            ],
        },
        details: {
            modalTitle: 'Formação de Líderes na Saúde',
            title: 'Formação de Líderes na Saúde',
            header: 'Jornada estratégica para transformar profissionais assistenciais e operacionais em gestores de alto impacto no setor de saúde.',
            overview:
                'Desenvolvido pela especialista Fernannda Tedesco, o curso foi desenhado para suprir a carência de formação em liderança em hospitais e clínicas brasileiros, preparando o profissional para desafios reais de gestão, segurança do paciente e eficiência operacional.',
            targetAudience: [
                {
                    title: 'Profissionais Plenos',
                    description:
                        'Candidatos que buscam a primeira oportunidade em cargos de coordenação ou supervisão nas áreas de Enfermagem, Medicina, áreas técnicas e administrativas da saúde.',
                },
                {
                    title: 'Líderes Atuais',
                    description:
                        'Gestores que já ocupam posições de decisão e precisam de ferramentas práticas para lidar com alta pressão, otimização de recursos e tomada de decisão crítica.',
                },
            ],
            developmentTopicsTitle: 'O Que Você Vai Desenvolver',
            modules: [
                {
                    title: 'Módulo 1: Governança e Segurança',
                    description:
                        'Estruturação de processos, conformidade regulatória e construção de uma cultura de segurança do paciente com ética e responsabilidade.',
                },
                {
                    title: 'Módulo 2: Gestão Ágil e Eficiência',
                    description:
                        'Aplicação de metodologias ágeis para reduzir desperdícios e otimizar recursos humanos e materiais sem perda de qualidade.',
                },
                {
                    title: 'Módulo 3: Liderança e Estratégia',
                    description:
                        'Desenvolvimento de liderança transformacional, inteligência emocional e capacidade de inspirar mudanças positivas na organização.',
                },
            ],
            differentialsTitle: 'Diferenciais e Metodologia',
            differentials: [
                'Conteúdo reflexivo em português brasileiro com áudio profissional para aprendizado flexível na rotina.',
                'Exemplos baseados em casos reais de hospitais brasileiros.',
                'Certificado de conclusão, emblemas de gamificação e validação por meio de quizzes.',
            ],
            careerImpactTitle: 'Impacto na Sua Carreira',
            careerImpact:
                'Ao concluir esta formação, o candidato fortalece seu perfil na Facilitô! ao demonstrar capacidade de reduzir turnover, aumentar eficiência operacional e tomar decisões críticas com confiança, impulsionando crescimento profissional com gestão humanizada e estratégica.',
        },
    },
];

export function getProfessionalCourseById(id: string): ProfessionalCourseConfig | undefined {
    return PROFESSIONAL_COURSES_CONFIG.find((course) => course.id === id);
}

