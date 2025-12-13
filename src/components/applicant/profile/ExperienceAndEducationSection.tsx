interface ExperienceAndEducationSectionProps {
    experience: string | null;
    academicBackground: string | null;
}

export default function ExperienceAndEducationSection({
    experience,
    academicBackground,
}: ExperienceAndEducationSectionProps) {
    if (!experience && !academicBackground) {
        return null;
    }

    return (
        <section className="space-y-3">
            {experience && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Experiência Profissional
                    </p>
                    <p className="text-sm text-[#111] leading-relaxed whitespace-pre-line">
                        {experience}
                    </p>
                </div>
            )}
            {academicBackground && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Formação Acadêmica
                    </p>
                    <p className="text-sm text-[#111] leading-relaxed whitespace-pre-line">
                        {academicBackground}
                    </p>
                </div>
            )}
        </section>
    );
}

