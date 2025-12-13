"use client";

import { X } from 'lucide-react';

interface AssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export default function AssessmentModal({ isOpen, onClose, children, title }: AssessmentModalProps) {
    if (!isOpen) return null;

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
                        {title && (
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                {title}
                            </h2>
                        )}
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
                    {children}
                </div>
            </div>
        </div>
    );
}

