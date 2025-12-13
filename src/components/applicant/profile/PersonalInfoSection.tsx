import { calculateAge } from './utils';

interface PersonalInfoSectionProps {
    fullName: string | null;
    birthDate: string | null;
    description: string | null;
}

export default function PersonalInfoSection({
    fullName,
    birthDate,
    description,
}: PersonalInfoSectionProps) {
    const age = calculateAge(birthDate);

    if (!fullName && !birthDate && !description) {
        return null;
    }

    return (
        <section className="space-y-3">
            {fullName && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Nome Completo
                    </p>
                    <p className="text-sm font-semibold text-[#111] leading-tight">
                        {fullName}
                    </p>
                </div>
            )}
            {age !== null && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Idade
                    </p>
                    <p className="text-sm font-semibold text-[#111] leading-tight">
                        {age} {age === 1 ? 'ano' : 'anos'}
                    </p>
                </div>
            )}
            {description && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Sobre
                    </p>
                    <p className="text-sm text-[#111] leading-relaxed">
                        {description}
                    </p>
                </div>
            )}
        </section>
    );
}

