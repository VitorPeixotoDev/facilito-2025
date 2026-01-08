'use client';

import { X, ExternalLink } from 'lucide-react';
import { getGraduationInfo, type GraduationInfo } from '@/lib/constants/graduations';

interface GraduationModalProps {
    isOpen: boolean;
    graduationKey: string | null;
    onClose: () => void;
}

/**
 * Modal para exibir informações detalhadas de uma graduação
 * Mobile-first design seguindo o padrão da aplicação
 */
export default function GraduationModal({
    isOpen,
    graduationKey,
    onClose,
}: GraduationModalProps) {
    if (!isOpen || !graduationKey) return null;

    const graduationInfo: GraduationInfo | null = getGraduationInfo(graduationKey);

    if (!graduationInfo) {
        console.warn(`Graduação não encontrada: ${graduationKey}`);
        return null;
    }

    const { label, imageSrc, description, developer } = graduationInfo;

    return (
        <div
            className="fixed inset-0 z-[60] bg-white lg:bg-black/50 lg:backdrop-blur-sm lg:flex lg:items-center lg:justify-center"
            onClick={onClose}
        >
            <div
                className="w-full h-full lg:w-full lg:h-auto lg:max-w-4xl lg:max-h-[90vh] lg:mx-auto bg-white lg:rounded-2xl lg:shadow-2xl overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header com botão de fechar */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm px-4 py-3 lg:px-6 lg:py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                            {description.title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="ml-auto p-2 hover:bg-slate-100 rounded-full transition-colors"
                            aria-label="Fechar modal"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="space-y-6">
                        {/* Badge/Imagem */}
                        {imageSrc && (
                            <div className="flex justify-center">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#5f9ea0]/20 flex items-center justify-center overflow-hidden bg-white">
                                    <img
                                        src={imageSrc}
                                        alt={label}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                                {label}
                            </h3>
                            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                {description.header}
                            </p>
                        </div>

                        {/* Body - Descrição detalhada */}
                        <div className="prose prose-sm sm:prose-base max-w-none">
                            <div className="whitespace-pre-line text-sm sm:text-base text-slate-700 leading-relaxed">
                                {description.body}
                            </div>
                        </div>

                        {/* Developer Info */}
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500 mb-1">
                                        Desenvolvido por
                                    </p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-900">
                                        {developer.name}
                                    </p>
                                </div>
                                {developer.url && (
                                    <a
                                        href={`https://${developer.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-medium text-[#5f9ea0] hover:text-[#4a8b8f] hover:bg-[#5f9ea0]/10 rounded-lg transition-colors"
                                    >
                                        <span>Visitar site</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
