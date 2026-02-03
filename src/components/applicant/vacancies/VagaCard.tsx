'use client';

import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Clock, Users, FileText, CheckCircle, X } from 'lucide-react';
import type { JobDisplay } from '@/lib/vacancies/types';
import { ConfirmCandidaturaModal } from './ConfirmCandidaturaModal';

interface VagaCardProps {
    vaga: JobDisplay;
    /** Distância aproximada em km da vaga até o candidato (quando aplicável) */
    distanceKm?: number;
    isCandidatada: boolean;
    onToggleCandidatura: (jobId: string) => void;
    onVerDetalhes: (vaga: JobDisplay) => void;
}

/**
 * Card individual de vaga
 */
export function VagaCard({ vaga, distanceKm, isCandidatada, onToggleCandidatura, onVerDetalhes }: VagaCardProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleToggleClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        onToggleCandidatura(vaga.id);
        setShowConfirmModal(false);
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 hover:shadow-lg transition-shadow duration-300">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5">
                                {vaga.titulo}
                            </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-[#5e9ea0]/10 text-[#5e9ea0] px-2.5 py-1 text-[10px] sm:text-xs font-medium border border-[#5e9ea0]/20 whitespace-nowrap">
                            {vaga.tipo}
                        </span>
                    </div>

                    {/* Informações */}
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-4 h-4 text-[#5e9ea0] flex-shrink-0" />
                            <span className="truncate">
                                {vaga.localizacao}
                                {distanceKm != null && (
                                    <span className="ml-1.5 text-[#5e9ea0] font-medium" title="Distância aproximada até você">
                                        (~{distanceKm} km)
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign className="w-4 h-4 text-[#5e9ea0] flex-shrink-0" />
                            <span className="truncate">{vaga.salario}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Users className="w-4 h-4 text-[#5e9ea0] flex-shrink-0" />
                            <span>{vaga.numero_candidatos || 0} candidatos</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-[#5e9ea0] flex-shrink-0" />
                            <span>{new Date(vaga.data_publicacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>

                    {/* Requisitos principais */}
                    {vaga.requisitos && vaga.requisitos.length > 0 && (
                        <div>
                            <p className="text-[10px] sm:text-xs font-medium text-slate-700 mb-1.5">
                                Requisitos:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {vaga.requisitos.slice(0, 4).map((requisito, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 text-[10px] sm:text-xs px-2 py-0.5"
                                    >
                                        {requisito}
                                    </span>
                                ))}
                                {vaga.requisitos.length > 4 && (
                                    <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 text-slate-600 text-[10px] sm:text-xs px-2 py-0.5">
                                        +{vaga.requisitos.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => onVerDetalhes(vaga)}
                            className="flex-1 inline-flex items-center justify-center rounded-full border border-[#5e9ea0] text-[#5e9ea0] hover:bg-[#5e9ea0]/5 px-4 py-2 text-xs sm:text-sm font-medium transition-colors"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Ver Detalhes
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleClick}
                            className={`flex-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${isCandidatada
                                ? 'bg-rose-50 border border-rose-300 text-rose-600 hover:bg-rose-100'
                                : 'bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isCandidatada ? (
                                <>
                                    <X className="w-4 h-4 mr-2" />
                                    Desistir
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Candidatar-me
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Modal de confirmação */}
                <ConfirmCandidaturaModal
                    isOpen={showConfirmModal}
                    isCandidatada={isCandidatada}
                    vagaTitulo={vaga.titulo}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            </div>
        </>
    );
}
