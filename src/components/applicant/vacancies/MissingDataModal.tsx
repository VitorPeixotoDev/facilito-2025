'use client';

import { AlertCircle, X, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MissingDataModalProps {
    isOpen: boolean;
    missingFields: {
        whatsapp?: boolean;
        email?: boolean;
        address?: boolean;
    };
    onClose: () => void;
}

/**
 * Modal informativo sobre dados faltantes necessários para candidatura
 */
export function MissingDataModal({ isOpen, missingFields, onClose }: MissingDataModalProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const hasWhatsApp = missingFields.whatsapp;
    const hasAddress = missingFields.address;

    const handleGoToProfile = () => {
        onClose();
        router.push('/applicant/profile');
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botão de fechar */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Fechar"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                <div className="p-6">
                    {/* Ícone e Título */}
                    <div className="text-center mb-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                            Dados Incompletos
                        </h3>
                    </div>

                    {/* Mensagem */}
                    <div className="mb-6">
                        <p className="text-sm sm:text-base text-slate-600 mb-4 text-center leading-relaxed">
                            Para se candidatar a uma vaga, você precisa completar os seguintes dados no seu perfil:
                        </p>

                        {/* Lista de campos faltantes */}
                        <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                            {hasWhatsApp && (
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">WhatsApp</p>
                                        <p className="text-xs text-slate-600">O número de WhatsApp é obrigatório para se candidatar a vagas</p>
                                    </div>
                                </div>
                            )}

                            {hasAddress && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">Endereço</p>
                                        <p className="text-xs text-slate-600">O endereço residencial é obrigatório para se candidatar a vagas</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botão de ação */}
                    <button
                        type="button"
                        onClick={handleGoToProfile}
                        className="w-full px-4 py-2.5 text-sm sm:text-base font-semibold rounded-full bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white shadow-md hover:shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        Completar Perfil
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

