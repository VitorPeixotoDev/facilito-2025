import { Mail, Phone, Globe, Instagram, Facebook, Linkedin } from 'lucide-react';

interface ContactAndSocialSectionProps {
    contactEmail: string | null;
    whatsapp: string | null;
    portfolio: string | null;
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
}

export default function ContactAndSocialSection({
    contactEmail,
    whatsapp,
    portfolio,
    instagram,
    facebook,
    linkedin,
}: ContactAndSocialSectionProps) {
    const hasContact = contactEmail || whatsapp || portfolio;
    const hasSocial = instagram || facebook || linkedin;

    if (!hasContact && !hasSocial) {
        return null;
    }

    const formatWhatsApp = (phone: string) => {
        // Remove caracteres não numéricos
        const numbers = phone.replace(/\D/g, '');
        // Formata como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        if (numbers.length === 11) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        } else if (numbers.length === 10) {
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
        }
        return phone;
    };

    return (
        <section className="space-y-3">
            {hasContact && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Contato
                    </p>
                    <div className="space-y-2">
                        {contactEmail && (
                            <a
                                href={`mailto:${contactEmail}`}
                                className="flex items-center gap-2.5 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-[#5f9ea0]" />
                                </div>
                                <span className="break-all">{contactEmail}</span>
                            </a>
                        )}
                        {whatsapp && (
                            <a
                                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-[#5f9ea0]" />
                                </div>
                                <span>{formatWhatsApp(whatsapp)}</span>
                            </a>
                        )}
                        {portfolio && (
                            <a
                                href={portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-4 h-4 text-[#5f9ea0]" />
                                </div>
                                <span className="break-all">{portfolio}</span>
                            </a>
                        )}
                    </div>
                </div>
            )}
            {hasSocial && (
                <div className="border-l-[3px] border-[#5f9ea0] pl-4 py-2.5">
                    <p className="text-xs text-[#5f9ea0] mb-1.5 font-medium uppercase tracking-wide">
                        Redes Sociais
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {instagram && (
                            <a
                                href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center">
                                    <Instagram className="w-4 h-4 text-[#5f9ea0]" />
                                </div>
                                <span>Instagram</span>
                            </a>
                        )}
                        {facebook && (
                            <a
                                href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center">
                                    <Facebook className="w-4 h-4 text-[#5f9ea0]" />
                                </div>
                                <span>Facebook</span>
                            </a>
                        )}
                        {linkedin && (
                            <a
                                href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-[#111] hover:text-[#5f9ea0] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5f9ea0]/20 to-[#5f9ea0]/10 flex items-center justify-center">
                                    <Linkedin className="w-4 h-4 text-[#5f9ea0]" />
                                </div>
                                <span>LinkedIn</span>
                            </a>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}

