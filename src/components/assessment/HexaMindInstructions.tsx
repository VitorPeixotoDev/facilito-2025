"use client";

import { Button } from '@/components/ui/button';

interface HexaMindInstructionsProps {
    onStart: () => void;
    onCancel?: () => void;
    image?: string;
}

export default function HexaMindInstructions({ onStart, onCancel, image }: HexaMindInstructionsProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-50 border border-slate-200">
                    {image ? (
                        <img
                            src={image}
                            alt="HexaMind"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                console.error('Erro ao carregar imagem:', e);
                                e.currentTarget.style.display = 'none';
                                // Fallback para o número 6 se a imagem falhar
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<span class="text-2xl font-bold text-amber-600">6</span>';
                                }
                            }}
                        />
                    ) : (
                        <span className="text-2xl font-bold text-amber-600">6</span>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">HexaMind</h1>
                    <span className="inline-block mt-1 px-3 py-1 bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold rounded-full border border-slate-200">
                        Teste de 6 Fatores de Personalidade
                    </span>
                </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Instruções do Questionário
            </h2>

            <div className="space-y-4">
                <p className="text-slate-600 text-sm sm:text-base">
                    O <strong>HexaMind</strong> é um instrumento psicológico avançado que avalia seis fatores fundamentais
                    da personalidade humana, projetado especificamente para contextos profissionais e organizacionais.
                </p>

                <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded">
                    <p className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                        Para Candidatos e Empresas:
                    </p>
                    <p className="text-slate-700 text-sm sm:text-base">
                        Este teste permite identificar candidatos cujos traços de personalidade
                        se alinham melhor com a cultura organizacional, otimizando o processo de seleção
                        e desenvolvimento profissional.
                    </p>
                </div>

                {/* Os 6 Fatores */}
                <div className="mt-6">
                    <h3 className="font-semibold text-slate-800 mb-3 text-sm sm:text-base">
                        Os 6 Fatores Avaliados:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                            { name: 'Honestidade/Humildade', color: 'bg-amber-100 text-amber-800' },
                            { name: 'Estabilidade Emocional', color: 'bg-blue-100 text-blue-800' },
                            { name: 'Extroversão', color: 'bg-orange-100 text-orange-800' },
                            { name: 'Amabilidade', color: 'bg-green-100 text-green-800' },
                            { name: 'Conscienciosidade', color: 'bg-purple-100 text-purple-800' },
                            { name: 'Abertura à Experiência', color: 'bg-indigo-100 text-indigo-800' },
                        ].map((factor) => (
                            <div key={factor.name} className={`p-3 rounded-lg border ${factor.color} border-opacity-50`}>
                                <p className="text-xs sm:text-sm font-medium">{factor.name}</p>
                            </div>
                        ))}
                    </div>
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
                            <li>• Itens 37-40 são de controle de consistência</li>
                        </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">
                            ⏱️ Duração estimada:
                        </h3>
                        <ul className="space-y-2 text-slate-600 text-xs sm:text-sm">
                            <li>• 40 questões (6-7 por fator)</li>
                            <li>• Aproximadamente 10 minutos</li>
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
                            { value: 1, label: 'Discordo totalmente', emoji: '🙅', description: 'Não se aplica a mim' },
                            { value: 2, label: 'Discordo', emoji: '👎', description: 'Raramente se aplica' },
                            { value: 3, label: 'Neutro', emoji: '😐', description: 'Às vezes se aplica' },
                            { value: 4, label: 'Concordo', emoji: '👍', description: 'Frequentemente se aplica' },
                            { value: 5, label: 'Concordo totalmente', emoji: '💯', description: 'Sempre se aplica' },
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
                                    <span className="block text-[10px] text-slate-500 mt-0.5">
                                        {item.description}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded">
                    <h3 className="font-bold text-slate-800 mb-3 text-sm sm:text-base">
                        ⚠️ Informações Importantes
                    </h3>
                    <ul className="space-y-2 text-slate-700 text-xs sm:text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-slate-600 mt-1">•</span>
                            <span><strong>Não há respostas certas ou erradas</strong> - responda com sinceridade</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-slate-600 mt-1">•</span>
                            <span><strong>Itens 37-40</strong> são de controle de consistência para validação da avaliação</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-slate-600 mt-1">•</span>
                            <span>Os resultados são <strong>confidenciais</strong> e destinados apenas para desenvolvimento profissional</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
                <Button
                    onClick={onStart}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
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

