interface AdditionalInfoSectionProps {
    hasChildren: boolean | null;
    hasDriversLicense: string[];
    freelancerServices: string[];
}

export default function AdditionalInfoSection({
    hasChildren,
    hasDriversLicense,
    freelancerServices,
}: AdditionalInfoSectionProps) {
    const hasLicense = hasDriversLicense && hasDriversLicense.length > 0;
    const hasServices = freelancerServices && freelancerServices.length > 0;

    if (hasChildren === null && !hasLicense && !hasServices) {
        return null;
    }

    return (
        <section className="space-y-3">
            {hasChildren !== null && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Filhos
                    </p>
                    <p className="text-sm font-semibold text-[#111] leading-tight">
                        {hasChildren ? 'Sim' : 'Não'}
                    </p>
                </div>
            )}
            {hasLicense && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Carteira de Motorista
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {hasDriversLicense.map((license, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30"
                            >
                                {license}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {hasServices && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Disponível para Freela de
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {freelancerServices.map((service, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[#5f9ea0]/10 text-[#111] border border-[#5f9ea0]/30"
                            >
                                {service}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

