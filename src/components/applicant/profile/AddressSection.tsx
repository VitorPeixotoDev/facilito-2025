import { MapPin } from 'lucide-react';

interface AddressSectionProps {
    homeAddress: {
        latitude: number;
        longitude: number;
        description: string;
    } | null;
}

export default function AddressSection({ homeAddress }: AddressSectionProps) {
    if (!homeAddress || !homeAddress.description) {
        return null;
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${homeAddress.latitude},${homeAddress.longitude}`;

    return (
        <section>
            <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                    Endereço
                </p>
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-[#5f9ea0]" />
                    </div>
                    <span className="break-words">{homeAddress.description}</span>
                </a>
            </div>
        </section>
    );
}

