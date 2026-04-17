"use client";

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import PersonalInfoSection from './PersonalInfoSection';
import SkillsAndCoursesSection from './SkillsAndCoursesSection';
import ExperienceAndEducationSection from './ExperienceAndEducationSection';
import ContactAndSocialSection from './ContactAndSocialSection';
import AdditionalInfoSection from './AdditionalInfoSection';
import AddressSection from './AddressSection';
import type { UserProfile } from '@/components/AuthClientProvider';
import type { AssessmentConfig } from '@/types/assessments';

interface UserInfoProps {
    profile: UserProfile;
    onAssessmentClick?: (assessment: AssessmentConfig) => void;
}

export default function UserInfo({ profile, onAssessmentClick }: UserInfoProps) {
    const sections = useMemo(() => {
        const allSections = [
            {
                title: 'Informações Pessoais',
                component: (
                    <PersonalInfoSection
                        fullName={profile.full_name}
                        birthDate={profile.birth_date}
                        description={profile.description}
                    />
                ),
            },
            {
                title: 'Especialidades e Formações',
                component: (
                    <SkillsAndCoursesSection
                        skills={profile.skills}
                        courses={profile.courses}
                        profileAnalysis={profile.profile_analysis}
                        authorizedCompetencies={profile.authorized_competencies}
                        graduations={profile.graduations}
                        userId={profile.id}
                        onAssessmentClick={onAssessmentClick}
                    />
                ),
            },
            {
                title: 'Experiência e Formação',
                component: (
                    <ExperienceAndEducationSection
                        experience={profile.experience}
                        academicBackground={profile.academic_background}
                    />
                ),
            },
            {
                title: 'Contato e Redes Sociais',
                component: (
                    <ContactAndSocialSection
                        contactEmail={profile.contact_email}
                        whatsapp={profile.whatsapp}
                        portfolio={profile.portfolio}
                        instagram={profile.instagram}
                        facebook={profile.facebook}
                        linkedin={profile.linkedin}
                    />
                ),
            },
            {
                title: 'Informações Adicionais',
                component: (
                    <AdditionalInfoSection
                        hasChildren={profile.has_children}
                        hasDriversLicense={profile.has_drivers_license}
                        freelancerServices={profile.freelancer_services}
                    />
                ),
            },
            {
                title: 'Endereço',
                component: <AddressSection homeAddress={profile.home_address} />,
            },
        ];

        // Filtra seções que têm conteúdo (componentes que não retornam null)
        return allSections.filter(section => {
            // Verifica se o componente tem props que indicam conteúdo
            if (section.title === 'Informações Pessoais') {
                return profile.full_name || profile.birth_date || profile.description;
            }
            if (section.title === 'Habilidades e Cursos') {
                return (profile.skills?.length ?? 0) > 0 ||
                    (profile.courses?.length ?? 0) > 0 ||
                    (profile.profile_analysis?.length ?? 0) > 0 ||
                    (profile.authorized_competencies?.length ?? 0) > 0 ||
                    (profile.graduations?.length ?? 0) > 0;
            }
            if (section.title === 'Experiência e Formação') {
                return profile.experience || profile.academic_background;
            }
            if (section.title === 'Contato e Redes Sociais') {
                return profile.contact_email || profile.whatsapp || profile.portfolio ||
                    profile.instagram || profile.facebook || profile.linkedin;
            }
            if (section.title === 'Informações Adicionais') {
                return profile.has_children !== null ||
                    (profile.has_drivers_license?.length ?? 0) > 0 ||
                    (profile.freelancer_services?.length ?? 0) > 0;
            }
            if (section.title === 'Endereço') {
                return profile.home_address?.description;
            }
            return true;
        });
    }, [profile]);

    if (sections.length === 0) {
        return (
            <Card className="rounded-[1.5rem] border border-[#d6e3e4] bg-gradient-to-br from-[#f8fbfb] to-[#eef5f5] p-5 shadow-sm sm:p-6">
                <p className="text-center text-sm text-slate-600">
                    Nenhuma informação disponível.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {sections.map((section, index) => (
                <Card
                    key={index}
                    className="rounded-[1.5rem] border border-[#d6e3e4] bg-white p-4 shadow-sm sm:p-6"
                >
                    <h2 className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-[#3f787a] sm:text-base">
                        {section.title}
                    </h2>
                    {section.component}
                </Card>
            ))}
        </div>
    );
}

