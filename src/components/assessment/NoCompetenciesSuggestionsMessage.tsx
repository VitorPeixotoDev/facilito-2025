'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface NoCompetenciesSuggestionsMessageProps {
    onRetakeTest: () => void;
}

/**
 * Componente exibido quando não há competências sugeridas para o perfil
 * Isso geralmente acontece quando há inconsistências nas respostas do teste
 */
export default function NoCompetenciesSuggestionsMessage({
    onRetakeTest,
}: NoCompetenciesSuggestionsMessageProps) {
    return (
        <Card className="p-6 sm:p-8 shadow-lg max-w-2xl mx-auto">
            <div className="text-center">
                {/* Ícone/Ilustração */}
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>

                {/* Título */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
                    Precisamos de uma nova leitura
                </h3>

                {/* Corpo da Mensagem */}
                <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                    <strong>Nossos sistemas detectaram algumas inconsistências nas suas respostas.</strong>
                    <br />
                    Isso pode acontecer quando estamos com pressa, distraídos ou em dúvida sobre como responder.
                    <br />
                    <br />
                    Para garantir um resultado preciso e útil para o seu desenvolvimento,
                    <strong> precisamos que você refaça o teste</strong>, tentando responder com mais atenção
                    e de acordo com seu <strong>comportamento real no trabalho</strong>.
                </p>

                {/* Dica Rápida */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm sm:text-base text-blue-800 font-medium mb-2">
                        💡 Dica para responder melhor:
                    </p>
                    <ul className="text-sm sm:text-base text-blue-700 space-y-1 list-disc pl-5">
                        <li>
                            Pense em situações <strong>reais do seu dia a dia profissional</strong>.
                        </li>
                        <li>Não tente adivinhar a resposta "correta" – seja sincero consigo mesmo.</li>
                        <li>Responda com calma, sem pressionar os botões rapidamente.</li>
                    </ul>
                </div>

                {/* Botão para refazer o teste */}
                <Button
                    onClick={onRetakeTest}
                    className="bg-[#5e9ea0] hover:bg-[#4a8b8f] text-white px-6 py-2.5 text-base font-medium"
                >
                    Refazer Teste
                </Button>
            </div>
        </Card>
    );
}
