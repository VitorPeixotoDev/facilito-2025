'use client';

import { useState } from 'react';
import { X, MapPin, CheckCircle, Briefcase, DollarSign } from 'lucide-react';
import type { JobDisplay } from '@/lib/vacancies/types';
import { ConfirmCandidaturaModal } from './ConfirmCandidaturaModal';

interface VagaDetailsModalProps {
    vaga: JobDisplay | null;
    isOpen: boolean;
    isCandidatada: boolean;
    onClose: () => void;
    onToggleCandidatura: (jobId: string) => void;
}

/**
 * Modal de detalhes da vaga
 */
export function VagaDetailsModal({
    vaga,
    isOpen,
    isCandidatada,
    onClose,
    onToggleCandidatura,
}: VagaDetailsModalProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleToggleClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        if (vaga) {
            onToggleCandidatura(vaga.id);
            setShowConfirmModal(false);
            onClose();
        }
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
    };

    if (!isOpen || !vaga) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl relative max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Botão de fechar */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>

                    <div className="p-4 sm:p-6">
                        {/* Header */}
                        <div className="mb-6 pr-8">
                            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                                {vaga.titulo}
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 text-sm">
                                <div className="flex items-start gap-1.5">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span className="flex flex-col">
                                        <span>{vaga.localizacao}</span>
                                        {'distanceKm' in vaga && typeof (vaga as { distanceKm?: number }).distanceKm === 'number' && (
                                            <span className="text-[#5e9ea0] font-bold text-xs mt-0.5">
                                                ~{(vaga as { distanceKm: number }).distanceKm} km de você
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{vaga.tipo}</span>
                                </div>
                            </div>
                        </div>

                        {/* Informações principais */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Salário</p>
                                <p className="font-semibold text-slate-900 text-sm sm:text-base flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {vaga.salario}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Modelo</p>
                                <p className="font-semibold text-slate-900 text-sm sm:text-base">{vaga.tipo}</p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Candidatos</p>
                                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                    {vaga.numero_candidatos || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs text-slate-600 mb-1">Publicada em</p>
                                <p className="font-semibold text-slate-900 text-sm sm:text-base">
                                    {new Date(vaga.data_publicacao).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        {/* Descrição */}
                        {vaga.descricao && (
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Sobre a vaga</h3>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{vaga.descricao}</p>
                            </div>
                        )}

                        {/* Requisitos */}
                        {vaga.requisitos && vaga.requisitos.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Habilidades Obrigatórias</h3>
                                <div className="flex flex-wrap gap-2">
                                    {vaga.requisitos.map((requisito, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full border border-[#5e9ea0] text-[#4a8b8f] text-xs sm:text-sm px-3 py-1"
                                        >
                                            {requisito}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Habilidades Preferidas */}
                        {vaga.habilidadesPreferidas && vaga.habilidadesPreferidas.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Habilidades Preferidas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {vaga.habilidadesPreferidas.map((habilidade, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full border border-slate-300 text-slate-600 bg-slate-50 text-xs sm:text-sm px-3 py-1"
                                        >
                                            {habilidade}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Benefícios */}
                        {vaga.benefits && (
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Benefícios</h3>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                                    {vaga.benefits}
                                </p>
                            </div>
                        )}

                        {/* Cultura da Empresa */}
                        {vaga.company_culture && (
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Cultura da Empresa</h3>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                                    {vaga.company_culture}
                                </p>
                            </div>
                        )}

                        {/* Botão de ação */}
                        <div className="pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleToggleClick}
                                className={`w-full h-12 text-sm sm:text-base font-semibold rounded-full transition-colors ${isCandidatada
                                    ? 'bg-rose-50 border border-rose-300 text-rose-600 hover:bg-rose-100'
                                    : 'bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {isCandidatada ? (
                                    <>
                                        <X className="w-5 h-5 inline mr-2" />
                                        Desistir da Candidatura
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 inline mr-2" />
                                        Candidatar-me
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal de confirmação */}
                <ConfirmCandidaturaModal
                    isOpen={showConfirmModal}
                    isCandidatada={isCandidatada}
                    vagaTitulo={vaga.titulo}
                    onConfirm={handleConfirm}
                    onCancel={handleCancelConfirm}
                />
            </div>
        </>
    );
}
