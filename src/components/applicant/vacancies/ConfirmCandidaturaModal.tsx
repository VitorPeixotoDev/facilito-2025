'use client';

import { AlertCircle, X } from 'lucide-react';

interface ConfirmCandidaturaModalProps {
    isOpen: boolean;
    isCandidatada: boolean;
    vagaTitulo: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Modal de confirmação para candidatar-se ou desistir de uma vaga
 */
export function ConfirmCandidaturaModal({
    isOpen,
    isCandidatada,
    vagaTitulo,
    onConfirm,
    onCancel,
}: ConfirmCandidaturaModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botão de fechar */}
                <button
                    type="button"
                    onClick={onCancel}
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
                            {isCandidatada ? 'Desistir da Candidatura?' : 'Confirmar Candidatura?'}
                        </h3>
                    </div>

                    {/* Mensagem */}
                    <div className="mb-6">
                        <p className="text-sm sm:text-base text-slate-600 text-center leading-relaxed">
                            {isCandidatada ? (
                                <>
                                    Tem certeza que deseja desistir da candidatura para a vaga{' '}
                                    <strong className="text-slate-900">&quot;{vagaTitulo}&quot;</strong>?
                                    <br />
                                    <br />
                                    Esta ação pode ser revertida candidatando-se novamente.
                                </>
                            ) : (
                                <>
                                    Deseja confirmar sua candidatura para a vaga{' '}
                                    <strong className="text-slate-900">&quot;{vagaTitulo}&quot;</strong>?
                                    <br />
                                    <br />
                                    O recrutador poderá visualizar seu perfil.
                                </>
                            )}
                        </p>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 text-sm sm:text-base font-medium rounded-full border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 text-sm sm:text-base font-semibold rounded-full transition-colors ${isCandidatada
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white shadow-md hover:shadow-lg'
                                }`}
                        >
                            {isCandidatada ? 'Desistir' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
