"use client";

import { Button } from '@/components/ui/button';

interface FiveMindInstructionsProps {
    onStart: () => void;
    onCancel?: () => void;
    image?: string;
}

export default function FiveMindInstructions({ onStart, onCancel, image }: FiveMindInstructionsProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-200">
                    {image ? (
                        <img
                            src={image}
                            alt="FiveMind"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : (
                        <img
                            src="/blue_head_lito.png"
                            alt="FiveMind"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                            }}
                        />
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">FiveMind</h1>
                    <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold rounded-full border border-slate-200">
                        Teste de Fit Cultural
                    </span>
                </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Instruções do Questionário
            </h2>

            <div className="space-y-4">
                <p className="text-slate-600 text-sm sm:text-base">
                    O <strong>FiveMind</strong> é um instrumento baseado no modelo IPIP-NEO (Big Five)
                    desenvolvido especificamente para avaliar o <strong>fit cultural</strong> em processos
                    de pré-seleção e recrutamento.
                </p>

                <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded">
                    <p className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                        Para Recrutadores e Contratantes:
                    </p>
                    <p className="text-slate-700 text-sm sm:text-base">
                        Este teste permite identificar candidatos cujos traços de personalidade
                        se alinham melhor com a cultura organizacional da sua empresa,
                        otimizando o processo de seleção.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                            📋 Como responder:
                        </h3>
                        <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
                            <li>• Leia cada afirmação cuidadosamente</li>
                            <li>• Responda com sinceridade</li>
                            <li>• Escolha a opção que melhor representa você</li>
                            <li>• Não há respostas certas ou erradas</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                            ⏱️ Duração estimada:
                        </h3>
                        <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
                            <li>• 20 questões (4 por fator)</li>
                            <li>• Aproximadamente 5-7 minutos</li>
                            <li>• Escala Likert de 1 a 5</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                        Escala de Respostas:
                    </h3>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        {[
                            { value: 1, label: 'Discordo totalmente', emoji: '🙅' },
                            { value: 2, label: 'Discordo', emoji: '👎' },
                            { value: 3, label: 'Neutro', emoji: '😐' },
                            { value: 4, label: 'Concordo', emoji: '👍' },
                            { value: 5, label: 'Concordo totalmente', emoji: '💯' },
                        ].map((item) => (
                            <div key={item.value} className="flex items-center gap-2">
                                <div className="w-8 h-8 flex items-center justify-center bg-[#5e9ea0] text-white border rounded-md font-semibold text-xs sm:text-sm">
                                    {item.value}
                                </div>
                                <div>
                                    <span className="block text-lg sm:text-xl">{item.emoji}</span>
                                    <span className="block font-bold text-xs text-slate-600 max-w-[80px] sm:max-w-none">
                                        {item.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                <Button
                    onClick={onStart}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                    Iniciar Questionário
                </Button>
                {onCancel && (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="w-full sm:w-auto"
                    >
                        Voltar
                    </Button>
                )}
                <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-right">
                    <p>Confidencial • Somente para fins de avaliação</p>
                </div>
            </div>
        </div>
    );
}

