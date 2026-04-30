'use client';

import { X, ExternalLink } from 'lucide-react';
import type { ProfessionalCourseConfig } from '@/lib/constants/professional_courses';

interface ProfessionalCourseModalProps {
    isOpen: boolean;
    course: ProfessionalCourseConfig | null;
    onClose: () => void;
}

export function ProfessionalCourseModal({ isOpen, course, onClose }: ProfessionalCourseModalProps) {
    if (!isOpen || !course) return null;

    const { details, imageSrc, courseName, partner, investiment, ctaUrl } = course;

    return (
        <div
            className="fixed inset-0 z-[60] bg-white lg:bg-black/50 lg:backdrop-blur-sm lg:flex lg:items-center lg:justify-center"
            onClick={onClose}
        >
            <div
                className="w-full h-full lg:w-full lg:h-auto lg:max-w-4xl lg:max-h-[90vh] lg:mx-auto bg-white lg:rounded-2xl lg:shadow-2xl overflow-y-auto flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm px-4 py-3 lg:px-6 lg:py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                            {details.modalTitle}
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

                <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f4fbfb] via-white to-white p-4 lg:p-6">
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-[#5f9ea0]/20 bg-gradient-to-r from-[#5e9ea0]/10 via-white to-[#5e9ea0]/5 p-4 sm:p-5">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-[#5f9ea0]/20 flex items-center justify-center overflow-hidden bg-white">
                                    <img
                                        src={imageSrc}
                                        alt={courseName}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                                <div>
                                    <p className="inline-flex rounded-full bg-[#5e9ea0] px-3 py-1 text-xs font-semibold tracking-wide text-white">
                                        Formação Profissional
                                    </p>
                                    <h3 className="mt-3 text-xl sm:text-3xl font-extrabold text-slate-900">
                                        {details.title}
                                    </h3>
                                    <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                                        {details.header}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-900">Visão Geral</h4>
                            <p className="mt-2 whitespace-pre-line text-sm sm:text-base text-slate-700 leading-relaxed">
                                {details.overview}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-900">A Quem se Destina?</h4>
                            <div className="space-y-3 mt-3">
                                {details.targetAudience.map((item) => (
                                    <div key={item.title} className="rounded-xl border border-[#5e9ea0]/20 bg-[#f7fbfb] p-3">
                                        <p className="text-sm sm:text-base font-semibold text-slate-900">{item.title}</p>
                                        <p className="text-sm sm:text-base text-slate-700 mt-1">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-900">{details.developmentTopicsTitle}</h4>
                            <div className="space-y-3 mt-3">
                                {details.modules.map((module) => (
                                    <div key={module.title} className="rounded-xl border border-slate-200 p-3">
                                        <p className="text-sm sm:text-base font-semibold text-slate-900">{module.title}</p>
                                        <p className="text-sm sm:text-base text-slate-700 mt-1">{module.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-900">{details.differentialsTitle}</h4>
                            <ul className="list-disc pl-5 space-y-1 mt-3">
                                {details.differentials.map((item) => (
                                    <li key={item} className="text-sm sm:text-base text-slate-700">{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h4 className="text-base sm:text-lg font-semibold text-slate-900">{details.careerImpactTitle}</h4>
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-2">
                                {details.careerImpact}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#5e9ea0]/30 bg-gradient-to-r from-[#5e9ea0] to-[#4a8b8f] p-4 sm:p-5 text-white shadow-lg">
                            <p className="text-xs sm:text-sm uppercase tracking-wide text-white/80">Investimento</p>
                            <p className="mt-1 text-3xl sm:text-4xl font-extrabold">{investiment}</p>
                            <p className="mt-2 text-sm sm:text-base text-white/90">
                                Garanta agora sua evolução para liderar equipes de saúde com estratégia e confiança.
                            </p>
                            <div className="mt-4">
                                <a
                                    href={ctaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm sm:text-base font-semibold text-[#3d7678] hover:bg-slate-100 transition-colors"
                                >
                                    Quero iniciar agora
                                </a>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-slate-500 mb-1">Desenvolvido por</p>
                                    <p className="text-sm sm:text-base font-semibold text-slate-900">{partner.name}</p>
                                </div>
                                {partner.url && (
                                    <a
                                        href={partner.url.startsWith('http') ? partner.url : `https://${partner.url}`}
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

